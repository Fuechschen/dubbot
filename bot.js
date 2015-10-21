var DubAPI = require('dubapi');
var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var request = require('request');
var Sequelize = require('sequelize');
var Promise = require('bluebird');
path = require('path');

var commands = [];
var config = require(path.resolve(__dirname, 'config.json'));
var bot;
var langfile;

sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    dialect: 'mysql',
    host: config.db.host,
    port: config.db.port
});

sequelize.authenticate().then(function (err) {
    if (err) {
        console.log('[ERROR]Unable to connect to the database:', err);
    }
    else {
        console.log('[SUCCESS]Connected to mysql database');
    }
});

var models = ['Track', 'User', 'CustomText'];
    models.forEach(function (model) {
        this[model] = sequelize.import(__dirname + '/models/' + model);
});

sequelize.sync();

new DubAPI(config.login, function(err, botg){
  if(err){return console.error(err);}
  bot = botg;
  console.log('Using DubApi ' + bot.version);
  loadlanguagefile();

  loadCommands();

  bot.connect(config.room);

  bot.on('connected', function(data){
      console.log('Connected: ', data);
  });

  bot.on('chat-message', function(data) {
      console.log('[CHAT]', data);
      handleCommand(data);
  });

  bot.on('room_playlist-update', function(data) {
      console.log('[ADVANCE]', data);

      Track.find({where: {fkid: data.media.fkid}}).then(function (row) {
          if(row !== undefined && row.blacklisted === true){
              bot.sendChat(S(langfile.messages.blacklist.is_blacklisted).replaceAll('&{track}', data.songInfo.name).s);
              bot.moderateSkip();
              return;
          }
      });

      var songdata = {
          name: data.media.name,
          fkid: data.media.fkid,
          thumbnail: data.media.images.thumbnail,
          type: data.media.type,
          songLength: data.media.songLength
      };

      Track.findOrCreate({where: {fkid: songdata.fkid}, defaults : songdata}).spread(function(song){song.updateAttributes(songdata);});

      var stats = {
          name: data.media.name,
          type: data.media.type,
          room: config.room
      };

      fs.writeFile(__dirname + "/stats.json", JSON.stringify(stats, null, 2), 'utf-8', function (err) {if (err) {return console.log(err);}});

      // if(config.timelimitenabled == true && data.songInfo.songLength > config.timelimit){
      //   bot.sendChat(langfile.messages.timelimit);
      //   bot.moderateSkip();
      // }

  });

  bot.on('error', function(err) {
      console.log('[ERROR]', err);
      bot.connect(config.room);
  });

  bot.on('user-join', function(data){
      console.log('[JOIN]', data);

      var userdata = {
          username: data.user.username,
          userid: data.user.userInfo.userid,
          roleid: data.user.roleid,
          dubs: data.roomUser.dubs,
          status: data.user.status
      };

      User.findOrCreate({where: {userid: userdata.userid}, defaults : userdata}).spread(function(user){user.updateAttributes(userdata);});

      if(data.user.username !== config.login.username && config.welcome_users === true){
        bot.sendChat(S(langfile.messages.welcome_users).replaceAll('&{username}', data.user.username).s)
      }
  });

  bot.on('user-leave', function(data){
      console.log('[LEAVE]', data);
  });

  bot.on('room-update', function(data){
      console.log('[ROOM-UPDATE]', data);
  });


});

function handleCommand(data){
    data.message = data.message.replace(/&#39;/g, '\'');
    data.message = data.message.replace(/&#34;/g, '\"');
    data.message = data.message.replace(/&amp;/g, '\&');
    data.message = data.message.replace(/&lt;/gi, '\<');
    data.message = data.message.replace(/&gt;/gi, '\>');

    var command = commands.filter(function (cmd) {
        var found = false;
        for (i = 0; i < cmd.names.length; i++) {
            if (!found) {
                found = (cmd.names[i] == data.message.toLowerCase() || (cmd.matchStart && data.message.toLowerCase().indexOf(cmd.names[i]) == 0));
            }
        }
        return found;
    })[0];
    if (command && command.enabled) {
        if (config.verboseLogging) {
            logger.info('[COMMAND]', JSON.stringify(data, null, 2));
        }
        command.handler(data, bot);
        console.log('[COMMAND] Executed command ' + command.names[0] + ' (' + data.message + ')');
    }

    if(S(data.message).startsWith(config.customtext_trigger) === true){
      CustomText.find({where: {trigger: S(data.message).chompLeft(config.customtext_trigger).s}}).then(function(row){
        if(row !== undefined){
          bot.sendChat(row.response);
        }
      });
    }
}

function loadCommands(){
    commands.push({
        names: ['!fs', '!skip'],
        handler: function(data){
            getRole(data.user.id, function (role){
                if(role > 3){
                  bot.moderateSkip();
                }
            });
        },
        hidden: true,
        enabled: true,
        matchStart: true
    });

    commands.push({
        names: ['!ping'],
        handler: function(data){
            getRole(data.user.id, function (role){
                if(role > 1){
                    bot.sendChat(langfile.messages.ping);
                }
            });
        },
        hidden: true,
        enabled: true,
        matchStart: true
    });

    commands.push({
        names: ['!reloadcommands'],
        handler: function(data){
            getRole(data.user.id, function (role){
                if(role > 3){
                    commands = [];
                    loadCommands();
                    bot.sendChat(langfile.messages.commands_reloaded);
                }
            });
        },
        hidden: true,
        enabled: true,
        matchStart: true
    });

    commands.push({
      names: ['!addcustomtext', '!addct'],
      hidden: true,
      enabled: true,
      matchStart: true,
      handler: function(data) {
          getRole(data.user.id, function (role){
              if(role > 3){
                  var texts = data.message.split('/:');
                  var newtrigger = S(texts[1].trim()).chompLeft(config.customtext_trigger).s;
                  var newresponse = texts[2].trim();
                  CustomText.findOrCreate({where: {trigger: newtrigger}, defaults: {trigger: newtrigger, response: newresponse}}).spread(function(customtext){customtext.updateAttributes({trigger: newtrigger, response: newresponse})});
              }
          });
      }
    })

    commands.push({
        names: ['!bl', '!blacklist'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            getRole(data.user.id, function (role){
                if(role > 2){
                    var track = bot.getMedia();
                    console.log(track);
                        Track.update({blacklisted: true}, {where: {fkid: track.fkid}});
                        bot.sendChat(S(S(langfile.messages.blacklist.blacklisted_by).replaceAll('&{track}', track.name).s).replaceAll('&{username}', data.user.username).s);
                        bot.moderateSkip();
                }
            });
        }
    });

    try {
        fs.readdirSync(path.resolve(__dirname, 'commands')).forEach(function (file) {
            var command = require(path.resolve(__dirname, 'commands/' + file));
            commands.push({
                names: command.names,
                handler: command.handler,
                hidden: command.hidden,
                enabled: command.enabled,
                matchStart: command.matchStart
            });
        });
    }
    catch (e) {
        console.error('Unable to load command: ', e);
    }
};

function loadlanguagefile() {
  var url;
  if(config.language_file === 'de'){
    url = 'https://cdn.dubbot.net/files/language/german.json';
  } else if(config.language_file === 'en'){
    url = 'https://cdn.dubbot.net/files/language/english.json';
  } else {
    url = config.language_file;
  }

  request.get(url, function(error, response, body){
    if(!error && response.statusCode == 200){
      langfile = JSON.parse(body);
    }

    if(langfile && langfile.status !== 'ok'){
      console.log('[LANGFILE] LangFile invalid. Using default instead!');
      langfile = require(path.resolve(__dirname, 'files/english.json'));
      return;
    }
    if(!langfile){
      console.log('[LANGFILE] LangFile could not be found. Using default...' + error);
      langfile = require(path.resolve(__dirname, 'files/english.json'));
      return;
    }
    console.log('[LANGFILE] Successfully loaded langfile!');
  });
}

function getRole(id, callback) {
        var user = bot.getUser(id);
        console.log(user);
        var role = 0;
        if(user.role === null){
            console.log('[ROLE] resolved ' + id + ' as 0');
            role = 0;
            if (typeof callback === 'function'){
                callback(role);
            }
            return;
        }
        switch(user.role.type){
            case "resident-dj":
                console.log('[ROLE] resolved ' + id + ' as 1');
                role = 1;
                break;
            case "vip":
                console.log('[ROLE] resolved ' + id + ' as 2');
                role = 2;
                break;
            case "mod":
                console.log('[ROLE] resolved ' + id + ' as 3');
                role = 3;
                break;
            case "manager":
                console.log('[ROLE] resolved ' + id + ' as 4');
                role = 4;
                break;
            case "co-owner":
                console.log('[ROLE] resolved ' + id + ' as 5');
                role = 5;
                break;
            case "owner":
                console.log('[ROLE] resolved ' + id + ' as 6');
                role = 6;
                break;
            default:
                console.log('[ROLE] resolved ' + id + ' as 0');
                role = 0;
                break;
        }
        if (typeof callback === 'function'){
            callback(role);
        }
        return role;
}
