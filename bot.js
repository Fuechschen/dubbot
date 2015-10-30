var DubAPI = require('dubapi');
var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var request = require('request');
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var moment = require('moment');
path = require('path');

var commands = [];
var config = require(path.resolve(__dirname, 'config.json'));
var bot;
var langfile;
var afkremovetimeout;

var skipable = true;
var helptimeout = false;

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

      afkremovetimeout = setTimeout(function () {
        performafkcheck();
      }, _.random(2, 6) * 60 * 1000);
  });

  bot.on('chat-message', function(data) {
      console.log('[CHAT]', data);
      if(data.user.username !== bot.getSelf().username){
        handleCommand(data);
        User.update({last_active: new Date(), afk: false, warned_for_afk: false}, {where: {userid: data.user.id}});
      }
  });

  bot.on('room_playlist-update', function(data) {
      console.log('[ADVANCE]', data);

      if(data.media !== undefined && data.media !== null){
        var songdata = {
            name: data.media.name,
            fkid: data.media.fkid,
            thumbnail: data.media.images.thumbnail,
            type: data.media.type,
            songLength: data.media.songLength
        };

        Track.findOrCreate({where: {fkid: songdata.fkid}, defaults : songdata}).spread(function(song){
          song.updateAttributes(songdata);
          if(song.blacklisted === true){
            bot.sendChat(S(langfile.messages.blacklist.is_blacklisted).replaceAll('&{track}', data.media.name).s);
            bot.moderateSkip();
            return;
          }
        });

        var stats = {
            name: data.media.name,
            type: data.media.type,
            room: config.room
        };

        fs.writeFile(__dirname + "/stats.json", JSON.stringify(stats, null, 2), 'utf-8', function (err) {if (err) {return console.log(err);}});

        if(config.timelimitenabled === true && data.media.songLength > config.timelimit * 1000){
          bot.sendChat(langfile.messages.timelimit);
          bot.moderateSkip();
        }
      }

  });

  bot.on('error', function(err) {
      console.log('[ERROR]', err);
      clearTimeout(afkremovetimeout);
      bot.reconnect();
  });

  bot.on('user-join', function(data){
      console.log('[JOIN]', data);

      var userdata = {
          username: data.user.username,
          userid: data.user.id,
          dubs: data.user.dubs,
          last_active: new Date(),
          afk: false,
          warned_for_afk: false
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
        if(row !== undefined && row !== null){
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
                if(role > 1 && skipable === true){
                  bot.moderateSkip();
                  skipable = false;
                  setTimeout(function () {
                    skipable = true;
                  }, 3 * 1000);
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
        names: ['!help'],
        handler: function(data){
            if(helptimeout === false){
              var mods = '';
              bot.getStaff().forEach(function(mod, index, array){
                if(mod.id !== bot.getSelf().id){
                  mods += '@' + mod.username + ' '
                }
              });
              bot.sendChat(S(langfile.messages.help).replaceAll('&{mods}', mods).s);
              helptimeout = true;
              setTimeout(function(){helptimeout = false}, 10 * 1000);
            }
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
    });

    commands.push({
        names: ['!unbl', '!unblacklist'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            getRole(data.user.id, function (role){
                if(role > 4){
                    var msg = data.message.split(' ');
                    var trackid = parseInt(msg[1]);
                    console.log(msg);
                    console.log(trackid);
                    Track.find({where: {id: trackid}}).then(function(row){
                      Track.update({blacklisted: false}, {where:{id: trackid}});
                      bot.sendChat(S(S(langfile.messages.blacklist.unblacklisted).replaceAll('&{track}', row.name).s).replaceAll('&{username}', data.user.username).s)
                    });
                }
            });
        }
    });

    commands.push({
      names: ['!afkcheck'],
      hidden: true,
      enabled: true,
      matchStart: false,
      handler: function(data) {
          getRole(data.user.id, function (role){
              if(role > 1){
                  afkcheck();
                  User.findAll({where: {afk: true}}).then(function(rows){
                    var afks = '';
                    rows.forEach(function(user, index, array){
                      afks += user.dataValues.username;
                      if(index !== rows.length -1){
                        afks += ', ';
                      }
                    });
                    if(afks !== undefined){
                      bot.sendChat('Currently AFK: ' + afks);
                    }
                  });
              }
          });
      }
    });

    commands.push({
        names: ['!bl', '!blacklist'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            getRole(data.user.id, function (role){
                if(role > 2 && skipable === true){
                    var track = bot.getMedia();
                    Track.update({blacklisted: true}, {where: {fkid: track.fkid}});
                    bot.sendChat(S(S(langfile.messages.blacklist.blacklisted_by).replaceAll('&{track}', track.name).s).replaceAll('&{username}', data.user.username).s);
                    bot.moderateSkip();
                    skipable = false
                    setTimeout(function () {
                      skipable = true;
                    }, 3 * 1000);
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
        var role = 0;
        if(bot.isCreator(user) === true){
          role = 6;
        }
        if(bot.isOwner(user) === true){
          role = 5;
        }
        if(bot.isManager(user) === true){
          role = 4;
        }
        if(bot.isMod(user) === true){
          role = 3;
        }
        if(bot.isVIP(user) === true){
          role = 2;
        }
        if(bot.isResidentDJ(user) === true){
          role = 1;
        }
        console.log('resolved ' + id + ' as ' + role);
        if (typeof callback === 'function'){
            callback(role);
        }
        return role;
}

function performafkcheck(){
  if(config.afkremoval === true){
    afkcheck();
    warnafk();
    removeafk();
    afkremovetimeout = setTimeout(function () {
      performafkcheck();
    }, _.random(2, 6) * 60 * 1000);
  }
}

function afkcheck(){
  var now = moment.utc();
  request.get('https://api.dubtrack.fm/room/' + config.room, function(error1, response1, body1){
    if(response1.statusCode === 200){
      var room = JSON.parse(body1);
      if(room.code === 200){
        request.get('https://api.dubtrack.fm/room/' + room.data._id + '/playlist', function(error, response, body){
          if(response.statusCode === 200){
            var queueobject = JSON.parse(body);
            if(queueobject.code === 200){
              var queue = queueobject.data;
              queue.forEach(function(user, index, array){
                User.find({where: {userid: user.userid}}).then(function(row){
                  if(row !== undefined && row !== null){
                    if(now.diff(row.last_active, 'seconds') > config.afktimeout){
                      User.update({afk: true}, {where: {userid: user.userid}});
                    }
                  }
                });
              });
            }
          }
        });
      }
    }
  });
}

function warnafk(){
  User.findAll({where: {afk: true}}).then(function(rows){
    var afks = '';
    rows.forEach(function(user, index, array){
      afks += '@' + user.dataValues.username + ' ';
      User.update({warned_for_afk: true}, {where: {userid: user.dataValues.userid}});
    });
    if(rows.length !== 0){
      bot.sendChat(afks + langfile.messages.afkwarning);
    }
  });
}

function removeafk(){
  User.findAll({where: {warned_for_afk: true}}).then(function(rows){
    var message = '';
    rows.forEach(function(user, index, array){
      message += '@' + user.dataValues.username + langfile.messages.afkremove;
      bot.moderateRemoveDJ(user.dataValues.userid);
    });
    bot.sendChat(message + langfile.messages.afkremove);
  });
}
