var DubAPI = require('dubapi');
var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var request = require('request');
var Sequelize = require('sequelize');
var Promise = require('bluebird');
var moment = require('moment');
var Cleverbot = require('cleverbot-node');

var commands = [];
var config = require(__dirname + '/config.json');
var bot;
var langfile;
var afkremovetimeout;

var skipable = true;
var helptimeout = false;

sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    dialect: 'mysql',
    host: config.db.host,
    port: config.db.port,
    logging: false
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

var cleverbot = new Cleverbot;
cleverbot.prepare();

new DubAPI(config.login, function(err, botg){
  if(err){return console.error(err);}
  bot = botg;
  console.log('Using DubApi ' + bot.version);
  loadlanguagefile();
  loadCommands();

  bot.connect(config.options.room);

  bot.on('connected', function(data){
      console.log('Connected: ', data);

      afkremovetimeout = setTimeout(function () {
        performafkcheck();
      }, _.random(2, 6) * 60 * 1000);
      User.update({removed_for_afk: false, warned_for_afk: false}, {where: {roleid: '1'}});
  });

  bot.on('chat-message', function(data) {
      console.log('[CHAT]', data.user.username, ':', data.message);
      if(data.user.username !== bot.getSelf().username){
        handleCommand(data);
        if(S(data.message).contains(config.afkremoval.chat_ignore_phrase) === false){
          User.update({last_active: new Date(), afk: false, warned_for_afk: false, removed_for_afk: false}, {where: {userid: data.user.id}});
        }

        if(config.chatfilter.enabled === true && getRole(data.user.id) < 2){
          if(config.chatfilter.dubtrackroom === true){
            if(S(data.message).contains('dubtrack.fm/join/') === true){
              bot.moderateDeleteChat(data.id);
              bot.sendChat(S(langfile.messages.chatfilter.dubtrackroom).replaceAll('&{username}', '@' + data.user.username).s);
              return;
            }
          }
          if(config.chatfilter.youtube === true){
            if(S(data.message).contains('youtu.be') === true || (S(data.message).contains('http') === true && S(data.message).contains('youtube.') === true) && getRole(data.user.id) < 1){
              bot.moderateDeleteChat(data.id);
              bot.sendChat(S(langfile.messages.chatfilter.youtube).replaceAll('&{username}', '@' + data.user.username).s);
              return;
            }
          }
          if(config.chatfilter.word_blacklist.enabled === true){
            var found = false;
            config.chatfilter.word_blacklist.words.forEach(function(word){
              if(S(data.message).contains(word) === true){
                found = true;
              }
            });
            if(found === true){
              bot.moderateDeleteChat(data.id);
              bot.sendChat(S(langfile.messages.chatfilter.word_blacklist).replaceAll('&{username}', '@' + data.user.username).s);
              return;
            }
          }
        }

        if(config.cleverbot.enabled === true && S(data.message).contains('@' + bot.getSelf().username) === true){
          cleverbot.write(S(data.message).replaceAll('@' + bot.getSelf().username, '').s, function(res){
            bot.sendChat('@' + data.user.username + ' ' + res.message);
          });
        }
      }
  });

  bot.on('room_playlist-update', function(data) {
      try{
        console.log('[ADVANCE]', data.user.username, ': [', data.media.name, '|', data.media.fkid, '|', data.media.type, '|', data.media.songLength, ']');
      } catch(e){

      }

      if(data.media !== undefined && data.media !== null){
        var songdata = {
            name: data.media.name,
            fkid: data.media.fkid,
            thumbnail: data.media.images.thumbnail,
            type: data.media.type,
            songLength: data.media.songLength
        };

        Track.findOrCreate({where: {fkid: songdata.fkid}, defaults: songdata}).spread(function(song){
          if(song.blacklisted === true && bot.getPlayID() === data.id){
            bot.sendChat(S(langfile.messages.blacklist.is_blacklisted).replaceAll('&{track}', data.media.name).s);
            bot.moderateSkip();
            return;
          }
          if(config.timelimit.enabled === true && data.media.songLength > config.timelimit.limit * 1000 && bot.getPlayID() === data.id){
            bot.sendChat(langfile.messages.timelimit.default);
            bot.moderateSkip();
            return;
          }
          if(config.autoskip.history.enabled === true && bot.getPlayID() === data.id){
            var now = moment();
            if(now.diff(song.last_played, 'minutes') < config.autoskip.history.time){
              bot.moderateSkip();
              bot.sendChat(langfile.messages.autoskip.history);
              return;
            }
          }
          if(song.label !== null && song.label !== undefined && bot.getPlayID() === data.id){
            Track.findAll({where: {label: song.label}}).then(function(rows){
              var songs = [];
              rows.forEach(function(s){
                songs.push(s.dataValues);
              });
              if(_.findWhere(songs, {blacklisted: true}) !== undefined && bot.getPlayID() === data.id){
                bot.sendChat(S(langfile.messages.blacklist.is_blacklisted).replaceAll('&{track}', data.media.name).s);
                bot.moderateSkip();
                return;
              }
            });
          }
          song.updateAttributes(songdata);
        });
      }

      if(data.lastPlay !== undefined && data.lastPlay !== null){
        Track.update({last_played: new Date()}, {where: {fkid: data.lastPlay.media.fkid}});
      }

      if(config.options.room_state_file === true){
        var usrs = [];
        var stff = [];
        bot.getUsers().forEach(function(user){if(user.id !== bot.getSelf().id){usrs.push(user);}});
        bot.getStaff().forEach(function(user){if(user.id !== bot.getSelf().id){stff.push(user);}});
        var stats = {
          room: config.options.room,
          media: bot.getMedia(),
          users: usrs,
          staff: stff,
          bot: bot.getSelf()
        };
        fs.writeFile(__dirname + '/stats.json', JSON.stringify(stats, null, '\t'), 'utf8');
      }
  });

  bot.on('error', function(err) {
      console.log('[ERROR]', err);
      clearTimeout(afkremovetimeout);
      bot.reconnect();
  });

  bot.on('user-join', function(data){
      console.log('[JOIN]', '[', data.user.username, '|', data.user.id, '|', data.user.dubs, ']');

      var userdata = {
          username: data.user.username,
          userid: data.user.id,
          roleid: '1',
          status: 1,
          dubs: data.user.dubs,
          last_active: new Date(),
          rank: getRole(data.user.id),
          afk: false,
          warned_for_afk: false,
          removed_for_afk: false
      };

      User.findOrCreate({where: {userid: userdata.userid}, defaults : userdata}).spread(function(user){user.updateAttributes(userdata);});

      if(data.user.username !== config.login.username && config.options.welcome_users === true){
        bot.sendChat(S(langfile.messages.welcome_users.default).replaceAll('&{username}', data.user.username).s)
      }
  });

  bot.on('user-leave', function(data){
      console.log('[LEAVE]', '[', data.user.username, '|', data.user.id, '|', data.user.dubs, ']');
      User.update({last_active: new Date(), afk: false, warned_for_afk: false, removed_for_afk: false, status: 0}, {where: {userid: data.user.id}});
  });

  bot.on('room-update', function(data){
      console.log('[ROOM-UPDATE]');
  });

  bot.on('userSetRole', function(data){
    console.log('[SETROLE]', data.mod.username, '|', data.user.username);
    getRole(user.id, function(role){
      User.update({rank: role}, {where: {userid: user.id}});
    });
  });


});

function handleCommand(data){
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
        command.handler(data, bot);
        console.log('[COMMAND] Executed command ' + command.names[0] + ' (' + data.message + ')');
    }

    if(S(data.message).startsWith(config.options.customtext_trigger) === true){
      CustomText.find({where: {trigger: S(data.message).chompLeft(config.options.customtext_trigger).s}}).then(function(row){
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
                  var dj = bot.getDJ();
                  bot.moderateSkip();
                  skipable = false;
                  setTimeout(function () {
                    skipable = true;
                  }, 3 * 1000);
                  var split = data.message.split(' ');
                  if(split.length > 1 && dj !== undefined){
                    var msg = split[1].trim();
                    setTimeout(function(){
                      bot.sendChat(S(_.findWhere(langfile.messages.skipreasons, {reason: msg}).msg).replaceAll('&{dj}', '@' + dj.username).s);
                    }, 6 * 1000);
                  }
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
                    bot.sendChat(langfile.messages.ping.default);
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
              if(mods.length > 2){
                bot.sendChat(S(langfile.messages.help.default).replaceAll('&{mods}', mods).s);
              } else {
                console.log(langfile.messages.help.no_one_here);
                bot.sendChat(langfile.messages.help.no_one_here);
              }
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
                    bot.sendChat(langfile.messages.commands_reloaded.default);
                }
            });
        },
        hidden: true,
        enabled: true,
        matchStart: true
    });

    commands.push({
        names: ['!link'],
        handler: function(data){
            var media = bot.getMedia();
            if(media === undefined){
              bot._.reqHandler.queue({url: 'https://api.dubtrack.fm/room/' + config.options.room, method: 'GET'}, function(code, body){
                if(code !== 200){
                  bot.sendChat(langfile.messages.link.no_media);
                } else {
                  if(body.data.roomType === 'iframe'){
                    bot.sendChat(S(langfile.messages.link.iframe).replaceAll('&{link}', body.data.roomEmbed).s);
                  } else {
                    bot.sendChat(langfile.messages.link.no_media);
                  }
                }
              });
              return;
            }
            if(media.type === 'soundcloud'){
              var uri = S(media.streamUrl).chompRight('/stream').s.trim() + '?client_id=d77e72464690eebf8501fd2b47bab662';
              request.get(uri, function(error, response, body){
                if(!error && response.statusCode === 200){
                  var data = JSON.parse(body);
                  bot.sendChat(S(langfile.messages.link.default).replaceAll('&{songlink}', data.permalink_url).s);
                }
              });
            } else if(media.type === 'youtube'){
              var split = media.images.thumbnail.split('/');
              var link = 'https://youtu.be/' + split[4].trim();
              bot.sendChat(S(langfile.messages.link.default).replaceAll('&{songlink}', link).s);
            }

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
                  var newtrigger = S(texts[1].trim()).chompLeft(config.options.customtext_trigger).s;
                  var newresponse = texts[2].trim();
                  CustomText.findOrCreate({where: {trigger: newtrigger}, defaults: {trigger: newtrigger, response: newresponse}}).spread(function(customtext){customtext.updateAttributes({trigger: newtrigger, response: newresponse})});
                  console.log('[CUSTOMTEXT]', data.user.username, ': [', texts[1], '|', texts[2], ']');
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
                    Track.find({where: {id: trackid}}).then(function(row){
                      Track.update({blacklisted: false}, {where:{id: trackid}});
                      bot.sendChat(S(S(langfile.messages.blacklist.unblacklisted).replaceAll('&{track}', row.name).s).replaceAll('&{username}', data.user.username).s)
                      console.log('[UNBLACKLIST]', data.user.username, ': [', row.name, '|', row.fkid, ']');
                    });
                }
            });
        }
    });

    commands.push({
        names: ['!setlabel', '!slbl'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            if(getRole(data.user.id) > 2){
              var split = data.message.trim().split(' ');
              if(split.length === 2){
                var media = bot.getMedia();
                var songid = media.fkid;
                Track.find({where: {fkid: songid}}).then(function(song){
                  if(song !== undefined){
                    if(song.label === null){
                      Track.update({label: split[1]}, {where: {fkid: songid}});
                      bot.sendChat(S(langfile.messages.labels.default).replaceAll('&{track}', song.name).replaceAll('&{label}', split[1]).s);
                      checksong(media);
                    } else {
                      bot.sendChat(S(langfile.messages.labels.existing_label).replaceAll('&{track}', song.name).replaceAll('&{label}', split[1]).replaceAll('&{id}', song.id).s);
                    }
                  }
                });
              } else if(split.length === 3){
                try {
                  var songid = parseInt(split[2]);
                  Track.find({where: {id: songid}}).then(function(song){
                    if(song.label === null){
                      Track.update({label: split[1]}, {where: {id: songid}});
                      bot.sendChat(S(langfile.messages.labels.default).replaceAll('&{track}', song.name).replaceAll('&{label}', split[1]).s);
                    } else {
                      bot.sendChat(S(langfile.messages.labels.existing_label).replaceAll('&{track}', song.name).replaceAll('&{label}', split[1]).replaceAll('&{id}', song.id).s);
                    }
                  });
                } catch (e){
                  bot.sendChat(langfile.messages.labels.argument_error);
                }
              } else {
                bot.sendChat(langfile.messages.labels.argument_error);
              }
            }
        }
    });

    commands.push({
        names: ['!overridelabel', '!olbl'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            if(getRole(data.user.id) > 2){
              var split = data.message.trim().split(' ');
              if(split.length === 2){
                var media = bot.getMedia();
                var songid = media.fkid;
                Track.find({where: {fkid: songid}}).then(function(song){
                  if(song !== undefined){
                      Track.update({label: split[1]}, {where: {fkid: songid}});
                      bot.sendChat(S(langfile.messages.labels.override).replaceAll('&{track}', song.name).replaceAll('&{label}', split[1]).s);
                      checksong(media);
                  }
                });
              } else if(split.length === 3){
                try {
                  var songid = parseInt(split[2]);
                  Track.find({where: {id: songid}}).then(function(song){
                      Track.update({label: split[1]}, {where: {id: songid}});
                      bot.sendChat(S(langfile.messages.labels.override).replaceAll('&{track}', song.name).replaceAll('&{label}', split[1]).s);
                  });
                } catch (e){
                  bot.sendChat(langfile.messages.labels.argument_error);
                }
              } else {
                bot.sendChat(langfile.messages.labels.argument_error);
              }
            }
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
                      if(afks.length > 2){
                        bot.sendChat(S(langfile.messages.afk.check).replaceAll('&{afks}', afks).s);
                      }
                    });

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
                    console.log('[BLACKLIST]', data.user.username, ': [', track.name, '|', track.fkid, ']');
                }
            });
        }
    });

    commands.push({
        names: ['!define'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            var msg = _.rest(data.message.split(' '), 1).join(' ').trim();
            if (msg.length > 0 && config.apiKeys.wordnik) {
                var uri = "http://api.wordnik.com:80/v4/word.json/" + msg + "/definitions?limit=200&includeRelated=true&useCanonical=true&includeTags=false&api_key=" + config.apiKeys.wordnik;
                request.get(uri, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    var definition = JSON.parse(body);
                    if (definition.length === 0) {
                      bot.sendChat(S(langfile.messages.define.no_definition_found).replaceAll('&{word}', msg).s);
                    } else {
                      bot.sendChat(S(S(langfile.messages.define.definition_found).replaceAll('&{word}', msg).s).replaceAll('&{definition}', definition[0].text).s);
                    }
                  }
                });
              }
        }
    });

    commands.push({
        names: ['!clearchat'],
        hidden: true,
        enabled: true,
        matchStart: true,
        handler: function(data) {
            if(getRole(data.user.id) > 2){
              var chathistory = bot.getChatHistory();
              chathistory.forEach(function(chat){
                setTimeout(function(){
                  bot.moderateDeleteChat(chat.id);
                }, _.random(1, 3) * _.random(1 * 5) * 1000);
              });
              setTimeout(function(){
                bot.sendChat(S(langfile.messages.clearchat.default).replaceAll('&{username}', data.user.username).s);
              }, 16 * 1000);
            }
        }
    });

    try {
        fs.readdirSync(__dirname + '/commands').forEach(function (file) {
            var command = require(__dirname + '/commands/' + file);
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
  if(config.options.language_file === 'de'){
    url = 'https://cdn.dubbot.net/files/language/german.json';
  } else if(config.options.language_file === 'en'){
    url = 'https://cdn.dubbot.net/files/language/english.json';
  } else {
    url = config.options.language_file;
  }

  request.get(url, function(error, response, body){
    if(!error && response.statusCode == 200){
      langfile = JSON.parse(body);
    }

    if(langfile && langfile.status !== 'ok'){
      console.log('[LANGFILE] LangFile invalid. Using default instead!');
      langfile = require(__dirname + '/files/language.json');
      return;
    }
    if(!langfile){
      console.log('[LANGFILE] LangFile could not be found. Using default...' + error);
      langfile = require(__dirname + '/files/language.json');
      return;
    }
    console.log('[LANGFILE] Successfully loaded langfile!');
    fs.writeFile(__dirname + '/files/language.json', JSON.stringify(langfile, null, '\t'));
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
        if (typeof callback === 'function'){
            callback(role);
        }
        return role;
}

function performafkcheck(){
  if(config.afkremoval.enabled === true){
    afkcheck();
    if(config.afkremoval.kick === true){
      kickforafk();
    }
    warnafk();
    removeafk();
    var minutes = _.random(2, 10);
    afkremovetimeout = setTimeout(function () {
      performafkcheck();
    }, minutes * 60 * 1000);
    console.log('[INFO]', 'Performing AFK-Check, Next check in', minutes, 'minutes');
  }
}

function afkcheck(){
  var now = moment.utc();
  request.get('https://api.dubtrack.fm/room/' + config.options.room, function(error1, response1, body1){
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
                    if(now.diff(row.last_active, 'seconds') > config.afkremoval.timeout){
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
  User.findAll({where: {afk: true, warned_for_afk: false, status: 1}}).then(function(rows){
    var afks = '';
    rows.forEach(function(user, index, array){
      afks += '@' + user.dataValues.username + ' ';
      User.update({warned_for_afk: true}, {where: {userid: user.dataValues.userid}});
    });
    if(rows.length !== 0){
      bot.sendChat(afks + langfile.messages.afk.warning);
    }
  });
}

function removeafk(){
  User.findAll({where: {warned_for_afk: true, status: 1}}).then(function(rows){
    var message = '';
    rows.forEach(function(user, index, array){
      if(bot.isStaff(bot.getUser(user.dataValues.userid)) === false){
        message += '@' + user.dataValues.username + ' ';
        bot.moderateRemoveDJ(user.dataValues.userid);
        User.update({removed_for_afk: true}, {where: {userid: user.dataValues.userid}});
      }
    });
    if(message.length > 3){
      bot.sendChat(message + langfile.messages.afk.remove);
    }
  });
}

function kickforafk(){
  User.findAll({where: {removed_for_afk: true, status: 1}}).then(function(rows){
    var message = '';
    rows.forEach(function(user, index, arr){
      message += '@' + user.dataValues.username + ' ';
      bot.moderateKickUser(user.userid);
    });
    if(message.length > 0){
      bot.sendChat(message + langfile.messages.afk.kick);
    }
  });
}

function checksong(media){
  var songdata = {
      name: media.name,
      fkid: media.fkid,
      thumbnail: media.images.thumbnail,
      type: media.type,
      songLength: media.songLength
  };

  Track.findOrCreate({where: {fkid: songdata.fkid}, defaults: songdata}).spread(function(song){
    if(song.blacklisted === true && bot.getMedia().fkid === media.fkid){
      bot.sendChat(S(langfile.messages.blacklist.is_blacklisted).replaceAll('&{track}', media.name).s);
      bot.moderateSkip();
      return;
    }
    if(song.label !== null && song.label !== undefined && bot.getMedia().fkid === media.fkid){
      Track.findAll({where: {label: song.label}}).then(function(rows){
        var songs = [];
        rows.forEach(function(s){
          songs.push(s.dataValues);
        });
        if(_.findWhere(songs, {blacklisted: true}) !== undefined && bot.getMedia().fkid === media.fkid){
          bot.sendChat(S(langfile.messages.blacklist.is_blacklisted).replaceAll('&{track}', media.name).s);
          bot.moderateSkip();
          return;
        }
      });
    }
    song.updateAttributes(songdata);
  });
}
