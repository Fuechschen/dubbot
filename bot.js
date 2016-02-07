var DubAPI = require('dubapi');
var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var request = require('request');
var Sequelize = require('sequelize');
var moment = require('moment');
var Cleverbot = require('cleverbot-node');

var commands = [];
var config = require(__dirname + '/config.js');
var SpamProtection = require(__dirname + '/objects/Spamprotection');
var Duell = require(__dirname + '/objects/Duell');
var langfile = require(__dirname + '/files/language.js');
var autotimer;
var duells = [];

var skipable = true;
var skipvotes = [];

var commandtimeout = {
    callmod: false,
    help: false
};

var spamfilterdata = {};

var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    dialect: config.db.dialect,
    host: config.db.host,
    port: config.db.port,
    logging: false
});

sequelize.authenticate().then(function (err) {
    if (err) console.log('[ERROR]Unable to connect to the database:', err);
    else console.log('[SUCCESS]Connected to mysql database');

});

var CustomText = sequelize.import(__dirname + '/models/CustomText');
var Label = sequelize.import(__dirname + '/models/Label');
var RandomMessage = sequelize.import(__dirname + '/models/RandomMessage');
var Track = sequelize.import(__dirname + '/models/Track');
var User = sequelize.import(__dirname + '/models/User');
var QueueBan = sequelize.import(__dirname + '/models/QueueBan');


Track.belongsToMany(Label, {through: 'tracktolabel'});
Label.belongsToMany(Track, {through: 'tracktolabel'});
QueueBan.belongsTo(User, {as: 'mod', foreignKey: 'mod_id'});
QueueBan.belongsTo(User, {as: 'user', foreignKey: 'user_id'});

sequelize.sync();

var cleverbot = new Cleverbot;
cleverbot.prepare();

moment.locale(langfile.momentjs.locale);

new DubAPI(config.login, function (err, bot) {
    if (err) return console.error(err);

    console.log('Using DubApi ' + bot.version);

    bot.connect(config.options.room);

    bot.on('connected', function (data) {
        console.log('Connected: ', data);
        loadCommands();
        setTimeout(function () {
            timings();
        }, 1000);

        User.update({removed_for_afk: false, warned_for_afk: false}, {where: {}});

        bot.getUsers().forEach(function (user) {
            spamfilterdata[user.id] = new SpamProtection(user.id);

            var userdata = {
                username: user.username,
                userid: user.id,
                dubs: user.dubs,
                last_active: new Date(),
                afk: false,
                status: true,
                warned_for_afk: false,
                removed_for_afk: false
            };

            User.findOrCreate({where: {userid: userdata.userid}, defaults: userdata}).spread(function (usr) {
                User.update(userdata, {where: {id: usr.id}});
            });
        });
    });

    bot.on('chat-message', function (data) {
        if (data.user !== undefined) {
            console.log('[CHAT]', data.user.username, ':', data.message);
            spamfilterdata[data.user.id].setMuted(false);

            if (data.user.username !== bot.getSelf().username) {
                handleCommand(data);
                if (S(data.message).contains(config.afkremoval.chat_ignore_phrase) === false) {
                    User.update({
                        last_active: new Date(),
                        afk: false,
                        warned_for_afk: false,
                        removed_for_afk: false,
                        afk_message_enabled: false
                    }, {where: {userid: data.user.id}});
                }

                if (config.chatfilter.enabled && !bot.hasPermission(data.user, 'delete-chat')) {
                    if (config.chatfilter.link_protection.enabled === true && spamfilterdata[data.user.id].canpostLinks() === false && (S(data.message).contains('http://') || S(data.message).contains('https://'))) {
                        deleteChatMessage(data.id, bot.getChatHistory());
                        bot.sendChat(S(langfile.chatfilter.link_protection).replaceAll('&{username}', data.user.username).s);
                        return;
                    } else if (config.chatfilter.images.enabled && config.chatfilter.images.regex.test(data.message.toLowerCase())) {
                        console.log(2, config.chatfilter.images.regex.test(data.message.toLowerCase()));
                        setTimeout(function () {
                            deleteChatMessage(data.id, bot.getChatHistory())
                        }, config.chatfilter.images.timeout * 1000);
                        return;
                    }
                    if (config.chatfilter.spam.enabled === true) {
                        if (spamfilterdata[data.user.id] !== undefined) {
                            if (spamfilterdata[data.user.id].checkforspam(data.message) === true) {
                                if (spamfilterdata[data.user.id].getWarnings() === config.chatfilter.spam.aggressivity.mute && spamfilterdata[data.user.id].isMuted() === false) {
                                    bot.moderateMuteUser(data.user.id);
                                    bot.sendChat(S(langfile.chatfilter.spam.mute).replaceAll('&{username}', data.user.username).s);
                                    cleanchat(data.user.id);
                                    spamfilterdata[data.user.id].setMuted(true);
                                    spamfilterdata[data.user.id].reset();
                                    return;
                                } else if (spamfilterdata[data.user.id].getScore() === config.chatfilter.spam.aggressivity.delete) {
                                    spamfilterdata[data.user.id].increaseSpamWarnings();
                                    cleanchat(data.user.id);
                                    bot.sendChat(S(langfile.chatfilter.spam.warning).replaceAll('&{username}', data.user.username).s);
                                    return;
                                } else spamfilterdata[data.user.id].increaseScore();
                            }
                            spamfilterdata[data.user.id].updateMessage(data.message);
                        } else spamfilterdata[data.user.id] = new SpamProtection(data.user.id);
                    }
                    if (config.chatfilter.dubtrackroom) {
                        if (S(data.message).contains('dubtrack.fm/join/') === true) {
                            deleteChatMessage(data.id, bot.getChatHistory());
                            bot.sendChat(S(langfile.chatfilter.dubtrackroom).replaceAll('&{username}', data.user.username).s);
                            spamfilterdata[data.user.id].increaseScore();
                            return;
                        }
                    }
                    if (config.chatfilter.youtube) {
                        if (S(data.message).contains('youtu.be') === true || (S(data.message).contains('http') === true && S(data.message).contains('youtube.') === true)) {
                            deleteChatMessage(data.id, bot.getChatHistory());
                            bot.sendChat(S(langfile.chatfilter.youtube).replaceAll('&{username}', data.user.username).s);
                            spamfilterdata[data.user.id].increaseScore();
                            return;
                        }
                    }
                    if (config.chatfilter.word_blacklist.enabled) {
                        var found = false;
                        config.chatfilter.word_blacklist.words.forEach(function (word) {
                            if (S(data.message).contains(word) === true) found = true;
                        });
                        if (found === true) {
                            deleteChatMessage(data.id, bot.getChatHistory());
                            bot.sendChat(S(langfile.chatfilter.word_blacklist).replaceAll('&{username}', data.user.username).s);
                            spamfilterdata[data.user.id].increaseScore();
                        }
                    }
                }
            }
        } else console.log('[CHAT]', 'undefined', ':', data.message);

    });

    bot.on('room_playlist-update', function (data) {
        try {
            console.log('[ADVANCE]', data.user.username, ': [', data.media.name, '|', data.media.id, '|', data.media.fkid, '|', data.media.type, '|', data.media.songLength, ']');
        } catch (e) {

        }

        if (config.autoskip.resdjskip.enabled === true) skipvotes = [];

        if (data.lastPlay !== undefined) Track.update({last_played: new Date()}, {where: {dub_id: data.lastPlay.media.id}});

        if (data.media !== undefined) {
            checksong(data.media, data.id);

            if (config.autoskip.stucksongs === true) {
                setTimeout(function () {
                    if (data.id === bot.getPlayID()) {
                        bot.moderateSkip();
                        bot.sendChat(S(langfile.autoskip.stuck_song).replaceAll('&{track}', data.media.name));
                    }
                }, (data.media.songLength + 7) * 1000);
            }

            if (config.options.upvote === true) bot.updub();
        }

        if (config.options.room_state_file === true) {
            var stats = {
                room: config.options.room,
                media: bot.getMedia(),
                users: [],
                staff: [],
                bot: bot.getSelf()
            };
            bot.getUsers().forEach(function (user) {
                if (user.id !== bot.getSelf().id) stats.users.push(user);
            });
            bot.getStaff().forEach(function (user) {
                if (user.id !== bot.getSelf().id) stats.staff.push(user);
            });
            fs.writeFile(__dirname + '/stats.json', JSON.stringify(stats, null, '\t'), 'utf8');
        }

        if (config.autodj.enabled === true && config.autodj.playlistid !== '') {
            if (bot.getQueue().length - 1 >= config.autodj.limits.max && bot.getQueue().length - 1 <= config.autodj.limits.min) {
                queuePlaylist(config.autodj.playlistid);
                shufflePlaylist();
            } else clearQueue();
        }
    });

    bot.on('error', function (err) {
        console.log('[ERROR]', err);
        clearTimeout(autotimer);
        bot.reconnect();
    });

    bot.on('user-join', function (data) {
        console.log('[JOIN]', '[', data.user.username, '|', data.user.id, '|', data.user.dubs, ']');
        if (spamfilterdata[data.user.id] === undefined) {
            spamfilterdata[data.user.id] = new SpamProtection(data.user.id);
            spamfilterdata[data.user.id].setpostLink(false);
            setTimeout(function () {
                spamfilterdata[data.user.id].setpostLink(true)
            }, config.chatfilter.link_protection.timeout * 60 * 1000);
        }

        var userdata = {
            username: data.user.username,
            userid: data.user.id,
            dubs: data.user.dubs,
            last_active: new Date(),
            afk: false,
            status: true,
            warned_for_afk: false,
            removed_for_afk: false
        };

        setTimeout(function () {
            User.findOrCreate({where: {userid: userdata.userid}, defaults: userdata}).spread(function (usr, created) {
                if (created) bot.sendChat(S(langfile.welcome_users.new).replaceAll('&{username}', data.user.username).s);
                else bot.sendChat(S(langfile.welcome_users.default).replaceAll('&{username}', data.user.username).s);
                usr.updateAttributes(userdata);
            });
        }, 10 * 1000)
    });

    bot.on('user-leave', function (data) {
        console.log('[LEAVE]', '[', data.user.username, '|', data.user.id, '|', data.user.dubs, ']');
        User.update({
            last_active: new Date(),
            afk: false,
            warned_for_afk: false,
            removed_for_afk: false,
            status: false
        }, {where: {userid: data.user.id}});
    });

    bot.on('room-update', function (data) {
        console.log('[ROOM-UPDATE]', JSON.stringify(data));
    });


    bot.on('user-unmute', function (data) {
        if (data.user && spamfilterdata[data.user.id]) spamfilterdata[data.user.id].setMuted(false);
    });

    bot.on('user-mute', function (data) {
        if (config.automation.delete_chat.mute && data.mod.id !== bot.getSelf().id) cleanchat(data.user.id);
    });

    bot.on('user-kick', function (data) {
        if (config.automation.delete_chat.kick && data.mod.id !== bot.getSelf().id) cleanchat(data.user.id);
    });

    bot.on('room_playlist-dub', function () {
        if (config.autoskip.votes.enabled) {
            var dj = bot.getDJ();
            var track = bot.getMedia();
            var score = bot.getScore();
            if (typeof config.autoskip.votes.condition === 'number') {
                if (score.downdubs > config.autoskip.votes.condition) {
                    bot.moderateSkip();
                    bot.sendChat(S(langfile.autoskip.vote.reach_limit).replaceAll('&{username}', dj.username).replaceAll('&{track}', track.name).s);
                }
            } else if (typeof config.autoskip.votes.condition === 'object') {
                if (score.downdubs >= config.autoskip.votes.condition.max) {
                    bot.moderateSkip();
                    bot.sendChat(S(langfile.autoskip.vote.reach_limit).replaceAll('&{username}', dj.username).replaceAll('&{track}', track.name).s);
                } else if (score.downdubs >= config.autoskip.votes.condition.min && (bot.getUsers().length) / score.downdubs > config.autoskip.votes.condition.ratio) {
                    bot.moderateSkip();
                    bot.sendChat(S(langfile.autoskip.vote.reach_limit).replaceAll('&{username}', dj.username).replaceAll('&{track}', track.name).s);
                }
            } else if (typeof config.autoskip.votes.condition === 'function') {
                score.usercount = bot.getUsers.length;
                score.users = bot.getUsers();
                score.staff = bot.getStaff();
                if (config.autoskip.votes.condition(score) === true) {
                    bot.moderateSkip();
                    bot.sendChat(S(langfile.autoskip.vote.reach_limit).replaceAll('&{username}', dj.username).replaceAll('&{track}', track.name).s);
                }
            }
        }
    });


    //functions

    function handleCommand(data) {
        var command = commands.filter(function (cmd) {
            var found = false;
            for (var i = 0; i < cmd.names.length; i++) {
                if (!found) found = (cmd.names[i] == data.message.toLowerCase() || (cmd.matchStart && data.message.toLowerCase().indexOf(cmd.names[i]) == 0));
            }
            return found;
        })[0];

        if (command && command.enabled) {
            command.handler(data, bot);
            console.log('[COMMAND] Executed command ' + command.names[0] + ' (' + data.message + ')');
        } else if (S(data.message).startsWith(config.options.customtext_trigger) === true) {
            CustomText.find({where: {trigger: S(data.message).chompLeft(config.options.customtext_trigger).s}}).then(function (row) {
                if (row !== undefined && row !== null) bot.sendChat(S(row.response).replaceAll('&{username}', data.user.username).s);
            });
        } else if (config.cleverbot.enabled === true && S(data.message).contains('@' + bot.getSelf().username) === true) {
            cleverbot.write(S(data.message).replaceAll('@' + bot.getSelf().username, '').s, function (res) {
                bot.sendChat('@' + data.user.username + ' ' + res.message);
            });
        } else if (config.afkremoval.afk_message.enabled) {
            User.findAll({where: {afk_message_enabled: true, status: true}}).spread(function (user) {
                if (user !== undefined && user !== null) {
                    if (S(data.message).contains('@' + user.username)) {
                        if (user.afk_message !== null && user.afk_message !== undefined)bot.sendChat(S(langfile.afk_message.with_message).replaceAll('&{username}', data.user.username).replaceAll('&{afk}', user.username).replaceAll('&{msg}', user.afk_message).s);
                        else bot.sendChat(S(langfile.afk_message.no_message).replaceAll('&{username}', data.user.username).replaceAll('&{afk}', user.username).s);

                    }
                }
            });
        }
    }

    function loadCommands() {
        //moderation commands
        commands.push({
            names: ['!fs', '!skip'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.skip,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'skip') && skipable) {
                    var dj = bot.getDJ();
                    bot.moderateSkip();
                    skipable = false;
                    setTimeout(function () {
                        skipable = true;
                    }, 3 * 1000);
                    var split = data.message.split(' ');
                    if (split.length > 1 && dj !== undefined) {
                        var msg = split[1].trim();
                        setTimeout(function () {
                            bot.sendChat(S(_.findWhere(config.skipreasons, {reason: msg}).msg).replaceAll('&{dj}', dj.username).s);
                        }, 3 * 1000);
                    }
                }
            }
        });

        commands.push({
            names: ['!bl', '!blacklist'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.blacklist,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'ban')) {
                    var track = bot.getMedia();
                    var dj = bot.getDJ();
                    bot.moderateSkip();
                    skipable = false;
                    setTimeout(function () {
                        skipable = true;
                    }, 3 * 1000);
                    var split = data.message.trim().split(' ');
                    if (split.length === 1) {
                        Track.update({blacklisted: true}, {where: {dub_id: track.id}});
                        bot.sendChat(S(langfile.blacklist.blacklisted).replaceAll('&{track}', track.name).replaceAll('&{moderator}', data.user.username).replaceAll('&{dj}', dj.username).s);
                    } else {
                        var reason = _.rest(split, 1).join(' ').trim();
                        Track.update({blacklisted: true, bl_reason: reason}, {where: {dub_id: track.id}});
                        bot.sendChat(S(langfile.blacklist.blacklisted_reason).replaceAll('&{track}', track.name).replaceAll('&{moderator}', data.user.username).replaceAll('&{dj}', dj.username).replaceAll('&{reason}', reason).s);
                    }
                }
            }
        });

        commands.push({
            names: ['!qbl', '!queueblacklist'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.queueblacklist,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'ban')) {
                    var split = data.message.trim().split(' ');
                    if (split.length > 1) {
                        var pos = parseInt(split[1]);
                        if (pos !== undefined && bot.getQueue().length >= pos - 1 && isNaN(pos) === false) {
                            var queueobj = bot.getQueue()[pos - 1];
                            Track.findOrCreate({
                                where: {dub_id: queueobj.media.id}, defaults: {
                                    name: queueobj.media.name,
                                    dub_id: queueobj.media.id,
                                    type: queueobj.media.type,
                                    source_id: queueobj.media.fkid,
                                    thumbnail: queueobj.media.thumbnail,
                                    blacklisted: true,
                                    songLength: queueobj.media.songLength
                                }
                            }).then(function (track) {
                                if (split.length > 2) {
                                    track[0].updateAttributes({bl_reason: _.rest(split, 2).join(' ').trim()});
                                    bot.moderateRemoveSong(queueobj.user.id);
                                    bot.sendChat(S(langfile.blacklist.queueblacklist_reason).replaceAll('&{dj}', queueobj.user.username).replaceAll('&{track}', queueobj.media.name).replaceAll('&{moderator}', data.user.username).replaceAll('&{reason}', _.rest(split, 2).join(' ').trim()).s);
                                } else {
                                    bot.moderateRemoveSong(queueobj.user.id);
                                    bot.sendChat(S(langfile.blacklist.queueblacklist).replaceAll('&{dj}', queueobj.user.username).replaceAll('&{track}', queueobj.media.name).replaceAll('&{moderator}', data.user.username).s);
                                }
                            });
                        } else bot.sendChat(langfile.error.argument);
                    }
                }
            }
        });

        commands.push({
            names: ['!idbl', '!idblacklist'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.idblacklist,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'ban')) {
                    var split = data.message.trim().split(' ');
                    if (split.length === 1) bot.sendChat(langfile.error.argument);
                    else {
                        var trackid = parseInt(split[1]);
                        if (trackid !== undefined && isNaN(id) === false) {
                            Track.find({where: {id: trackid}}).then(function (row) {
                                if (split.length === 2) {
                                    Track.update({blacklisted: true}, {where: {id: trackid}});
                                    bot.sendChat(S(langfile.blacklist.id_blacklist).replaceAll('&{track}', row.name).replaceAll('&{moderator}', data.user.username).s);
                                } else {
                                    Track.update({
                                        blacklisted: true,
                                        bl_reason: _.rest(split, 2).join(' ').trim()
                                    }, {where: {id: trackid}});
                                    bot.sendChat(S(langfile.blacklist.id_blacklist_reason).replaceAll('&{track}', row.name).replaceAll('&{moderator}', data.user.username).replaceAll('&{reason}', _.rest(split, 2).join(' ').trim()).s);
                                }
                            });
                        } else bot.sendChat(langfile.error.argument);
                    }
                }
            }
        });

        commands.push({
            names: ['!unbl', '!unblacklist'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.unblacklist,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'ban')) {
                    var split = data.message.split(' ');
                    if (split.length === 1) bot.sendChat(langfile.error.argument);
                    else if (split.length === 2) {
                        var trackid = parseInt(split[1]);
                        if (trackid !== undefined && isNaN(trackid) === false) {
                            Track.find({where: {id: trackid}}).then(function (row) {
                                Track.update({blacklisted: false, bl_reason: null}, {where: {id: trackid}});
                                bot.sendChat(S(langfile.blacklist.unblacklisted).replaceAll('&{track}', row.name).replaceAll('&{username}', data.user.username).s);
                            });
                        } else bot.sendChat(langfile.error.argument);
                    } else {
                        _.rest(split, 1).forEach(function (arg) {
                            var trackid = parseInt(arg);
                            if (trackid !== undefined && isNaN(trackid) === false) {
                                Track.find({where: {id: trackid}}).then(function (row) {
                                    Track.update({blacklisted: false, bl_reason: null}, {where: {id: row.id}});
                                    bot.sendChat(S(langfile.blacklist.unblacklisted).replaceAll('&{track}', row.name).replaceAll('&{username}', data.user.username).s);
                                });
                            } else bot.sendChat(langfile.error.argument);
                        });
                    }
                }
            }
        });


        //todo fix sequelize errors
        /*commands.push({
         names: ['!label', '!lbl'],
         hidden: true,
         enabled: true,
         matchStart: true,
         handler: function (data) {
         if (bot.hasPermission(data.user, 'ban')) {
         var media = bot.getMedia();
         var playid = bot.getPlayID();
         var split = data.message.trim().split(' ');
         if (split.length === 1) {
         Track.find({where: {dub_id: media.id}}).then(function (track) {
         track.getLabels().then(function (labels) {
         var lab = '';
         labels.forEach(function (label, index) {
         lab += label.name;
         if (index !== labels.length - 1) {
         lab += ', ';
         }
         });
         bot.sendChat(S(langfile.labels.labels_found).replaceAll('&{track}', track.name).replaceAll('&{labels}', lab).s);
         });
         });
         } else if (split.length === 3) {
         if (split[1] === 'add') {
         Label.findOrCreate({
         where: {name: split[2]},
         defaults: {name: split[2]}
         }).then(function (label) {
         Track.find({where: {dub_id: media.id}}).then(function (track) {
         label.addTracks(track);
         checksong(media, playid);
         });
         });
         } else if (split[1] === 'set') {
         Label.findOrCreate({
         where: {name: split[2]},
         defaults: {name: split[2]}
         }).then(function (label) {
         Track.find({where: {dub_id: media.id}}).then(function (track) {
         track.setLabels([label]);
         checksong(media, playid);
         });
         });
         }
         }
         }
         }
         });*/

        commands.push({
            names: ['!move'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.move,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'queue-order')) {
                    var split = data.message.split(' ');
                    var user = bot.getUserByName(S(split[1].trim()).chompLeft('@').s, true);
                    var pos = parseInt(split[2].trim());
                    if (user !== undefined && pos !== undefined) bot.moderateMoveDJ(user.id, pos - 1);
                    else bot.sendChat(langfile.error.argument);
                }
            }
        });

        commands.push({
            names: ['!clearchat'],
            hidden: true,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.clearchat,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'delete-chat')) {
                    var chathistory = bot.getChatHistory();
                    chathistory.forEach(function (chat) {
                        setTimeout(function () {
                            bot.moderateDeleteChat(chat.id);
                        }, _.random(1, 3) * _.random(1, 5) * 1000);
                    });
                    setTimeout(function () {
                        bot.sendChat(S(langfile.clearchat.default).replaceAll('&{username}', data.user.username).s);
                    }, 16 * 1000);
                }
            }
        });

        commands.push({
            names: ['!delchat'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.delchat,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'delete-chat')) {
                    var split = data.message.trim().split(' ');
                    if (split.length === 2) {
                        User.find({where: {username: S(split[1]).replaceAll('@', '').s}}).then(function (user) {
                            if (user !== undefined && user !== null) cleanchat(user.id);
                            else bot.sendChat(langfile.error.argument);
                        });
                    } else bot.sendChat(langfile.error.argument);
                }
            }
        });

        commands.push({
            names: ['!clearqueue'],
            hidden: true,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.clearQueue,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'queue-order')) {
                    bot.moderateLockQueue(true);
                    bot.sendChat(S(langfile.clearqueue.default).replaceAll('&{moderator}', data.user.username).s);
                    bot.getQueue().forEach(function (queueobject) {
                        setTimeout(function () {
                            bot.moderateRemoveDJ(queueobject.user.id);
                        }, _.random(2, 10) * 1000);
                    });
                }
            }
        });

        commands.push({
            names: ['!lock'],
            hidden: true,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.lock,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'lock-queue')) bot.moderateLockQueue(true);
            }
        });

        commands.push({
            names: ['!unlock'],
            hidden: true,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.unlock,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'lock-queue')) bot.moderateLockQueue(false);
            }
        });

        commands.push({
            names: ['!queueban', '!qban'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.queueban,
            handler: function (data) {
                var split = data.message.trim().split(' ');
                if (split.length === 1) {
                    QueueBan.find({where: {dub_user_id: data.user.id, active: true}}).then(function (qban) {
                        if (qban !== undefined && qban !== null) {
                            var msg = '';
                            if (qban.reason !== null && qban.reason !== undefined)msg += S(langfile.queueban.check.positive_reason).replaceAll('&{username}', data.user.username).replaceAll('&{reason}', qban.reason).s;
                            else msg += S(langfile.queueban.check.positive_reason).replaceAll('&{username}', data.user.username).s;

                            if (qban.permanent) msg += ' ' + langfile.queueban.check.expires.never;
                            else msg += ' ' + S(langfile.queueban.check.expires.time).replaceAll('&{time}', moment().to(moment(qban.expires))).s;
                            bot.sendChat(msg);
                        } else bot.sendChat(S(langfile.queueban.check.negative).replaceAll('&{username}', data.user.username).s);
                    });
                } else if (bot.hasPermission(data.user, 'ban') || bot.hasPermission(data.user, 'unban')) {
                    if ((split[1] === 'ban') && bot.hasPermission(data.user, 'ban') && split.length >= 4) {
                        User.find({where: {username: {$like: S(split[2]).chompLeft('@').s}}}).then(function (banned) {
                            if (banned !== undefined && banned !== null) {
                                User.find({where: {userid: data.user.id}}).then(function (mod) {
                                    var r = (_.rest(split, 4).join(' ').trim().length !== 0 ? _.rest(split, 4).join(' ').trim() : undefined);
                                    if (split[3] === 'permanent') {
                                        QueueBan.create({
                                            dub_user_id: banned.userid,
                                            dub_mod_id: mod.userid,
                                            mod: mod,
                                            user: banned,
                                            reason: r,
                                            permanent: true,
                                            active: true
                                        });
                                        if (r) bot.sendChat(S(langfile.queueban.mod.ban.permanent_reason).replaceAll('&{banned}', banned.username).replaceAll('&{mod}', mod.username).replaceAll('&{reason}', r).s);
                                        else bot.sendChat(S(langfile.queueban.mod.ban.permanent).replaceAll('&{banned}', banned.username).replaceAll('&{mod}', mod.username).s);
                                    } else {
                                        var time = {
                                            amount: parseInt(split[3].trim().split('')[0]),
                                            key: split[3].trim().split('')[1]
                                        };
                                        if (time) {
                                            QueueBan.create({
                                                dub_user_id: banned.userid,
                                                dub_mod_id: mod.userid,
                                                mod: mod,
                                                user: banned,
                                                reason: r,
                                                expires: moment().add(time.amount, time.key),
                                                permanent: false,
                                                active: true
                                            });
                                            if (r) bot.sendChat(S(langfile.queueban.mod.ban.time_reason).replaceAll('&{banned}', banned.username).replaceAll('&{mod}', mod.username).replaceAll('&{reason}', r).s);
                                            else bot.sendChat(S(langfile.queueban.mod.ban.time).replaceAll('&{banned}', banned.username).replaceAll('&{mod}', mod.username).s);
                                        } else bot.sendChat(langfile.error.argument);
                                    }
                                });
                            } else bot.sendChat(langfile.error.argument);
                        });
                    } else if ((split[1] === 'remove' || split[1] === 'rem' || split[1] === 'delete' || split[1] === 'del') && split.length === 3) {
                        User.find({where: {username: {$like: S(split[2]).chompLeft('@').s}}}).then(function (user) {
                            if (user !== undefined && user !== null) {
                                QueueBan.update({active: false}, {where: {dub_user_id: user.userid}});
                                bot.sendChat(S(langfile.queueban.mod.unban).replaceAll('&{username}', user.username).s);
                            } else bot.sendChat(langfile.error.argument);
                        });
                    } else bot.sendChat(langfile.error.argument);
                }
            }
        });

        commands.push({
            names: ['!sudo'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.sudo,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'set-roles')) bot.sendChat(S(data.message).chompLeft('!sudo').s.trim());
            }
        });

        commands.push({
            names: ['!addcustomtext', '!addct'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.addcustomtext,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'set-roles')) {
                    var texts = data.message.trim().split(' ');
                    var newtrigger = S(texts[1].trim()).chompLeft(config.options.customtext_trigger).s;
                    var newresponse = _.rest(texts, 2).join(' ').trim();
                    CustomText.findOrCreate({
                        where: {trigger: newtrigger},
                        defaults: {trigger: newtrigger, response: newresponse}
                    }).spread(function (customtext) {
                        customtext.updateAttributes({trigger: newtrigger, response: newresponse})
                    });
                    console.log('[CUSTOMTEXT]', data.user.username, ': [', texts[1], '|', texts[2], ']');
                }
            }
        });

        commands.push({
            names: ['!randommessage', '!rndmsg'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.randommessage,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'set-roles')) {
                    var split = data.message.trim().split(' ');
                    if (split.length === 2) {
                        if (split[1] === 'list') {
                            RandomMessage.findAll().then(function (rows) {
                                rows.forEach(function (row) {
                                    bot.sendChat('[' + row.id + '|' + row.status + '] ' + row.message);
                                });
                            });
                        }
                    } else if (split.length === 3) {
                        var msg = parseInt(split[2]);
                        if (split[1] === 'del') {
                            if (msg !== undefined) {
                                RandomMessage.destroy({where: {id: msg}});
                                bot.sendChat(S(langfile.randommessage.delete).replaceAll('&{id}', msg).s);
                            } else bot.sendChat(langfile.error.argument);
                        } else if (split[1] === 'disable') {
                            if (msg !== undefined) {
                                RandomMessage.update({status: false}, {where: {id: msg}});
                                bot.sendChat(S(langfile.randommessage.disable).replaceAll('&{id}', msg).s);
                            } else bot.sendChat(langfile.error.argument);
                        } else if (split[1] === 'enable') {
                            if (msg !== undefined) {
                                RandomMessage.update({status: true}, {where: {id: msg}});
                                bot.sendChat(S(langfile.randommessage.enable).replaceAll('&{id}', msg).s);
                            } else bot.sendChat(langfile.error.argument);
                        }
                    } else if (split.length > 2) {
                        if (split[1] === 'add') {
                            RandomMessage.create({message: _.rest(split, 2).join(' ').trim()});
                            bot.sendChat(langfile.randommessage.add);
                        }
                    }
                }
            }
        });

        commands.push({
            names: ['!afkcheck'],
            hidden: true,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.afkcheck,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'skip')) {
                    afkcheck();
                    User.findAll({where: {afk: true}}).then(function (rows) {
                        var afks = '';
                        rows.forEach(function (user, index) {
                            afks += user.username;
                            if (index !== rows.length - 1) afks += ', ';
                            if (afks.length > 2) bot.sendChat(S(langfile.afk.check).replaceAll('&{afks}', afks).s);
                        });
                    });
                }
            }
        });

        commands.push({
            names: ['!afkreset'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.afkreset,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'queue-order')) {
                    var split = data.message.trim().split(' ');
                    if (split.length > 1) {
                        User.find({where: {username: {$like: '%' + S(_.rest(split, 1).join(' ').trim()).replaceAll('@', '').s + '%'}}}).then(function (user) {
                            if (user !== undefined && user !== null) {
                                User.update({last_active: new Date()}, {where: {id: user.id}});
                                bot.sendChat(S(langfile.afk.reset).replaceAll('&{username}', user.username).s);
                            } else bot.sendChat(langfile.error.argument);

                        });
                    } else bot.sendChat(langfile.error.argument);

                }
            }
        });

        commands.push({
            names: ['!lottery'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.lottery,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'queue-order')) {
                    var split = data.message.split(' ');
                    var time = 2;
                    if (split.length === 2) time = parseInt(split[1].trim());
                    setTimeout(function () {
                        var queue = bot.getQueue();
                        var mover = queue[_.random(0, queue.length - 1)];
                        if (mover === undefined) bot.sendChat(langfile.lottery.no_winner);
                        else {
                            bot.sendChat(S(langfile.lottery.victory).replaceAll('&{username}', mover.user.username));
                            bot.moderateMoveDJ(mover.uid, 0);
                            if (config.points.enabled && config.points.lottery) points_manipulator("award", config.points.lottery_reward, [mover.user]);
                        }
                    }, time * 60 * 1000);
                    bot.sendChat(S(langfile.lottery.started).replaceAll('&{time}', time).s);
                }
            }
        });

        commands.push({
            names: ['!roulette'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.roulette,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'queue-order')) {
                    var split = data.message.split(' ');
                    var time = 2;
                    if (split.length === 2) time = parseInt(split[1].trim());
                    setTimeout(function () {
                        var queue = bot.getQueue();
                        var moverpos = _.random(1, queue.length - 1);
                        var mover = queue[moverpos];
                        if (mover === undefined) bot.sendChat(langfile.roulette.no_winner);
                        else {
                            bot.sendChat(S(langfile.roulette.victory).replaceAll('&{username}', mover.user.username));
                            bot.moderateMoveDJ(mover.uid, _.random(0, moverpos));
                            if (config.points.enabled && config.points.roulette) points_manipulator("award", config.points.roulette_reward, [mover.user]);
                        }
                    }, time * 60 * 1000);
                    bot.sendChat(S(langfile.roulette.started).replaceAll('&{time}', time).s);
                }
            }
        });

        //tech commands
        commands.push({
            names: ['!ping'],
            handler: function (data) {
                if (bot.hasPermission(data.user, 'set-dj')) bot.sendChat(langfile.ping.default);
            },
            hidden: true,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.ping
        });

        commands.push({
            names: ['!restart'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.restart,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'set-roles') && config.pm2.enabled === true) {
                    var pm2 = require('pm2');
                    pm2.connect(function (err) {
                        if (err) bot.sendChat(langfile.error.default);
                        else {
                            var time = parseInt(S(data.message).replaceAll('!restart', '').s.trim()) || 0;
                            if (time !== 0) bot.sendChat(S(langfile.pm2.restart_time).replaceAll('&{minutes}', time).s);
                            setTimeout(function () {
                                bot.sendChat(langfile.pm2.restart_now);
                                setTimeout(function () {
                                    pm2.restart(config.pm2.processname, function (err) {
                                        if (err) bot.sendChat(langfile.error.default);
                                    });
                                }, 5 * 1000);
                            }, time * 60 * 1000);
                        }
                    })
                }
            }
        });

        commands.push({
            names: ['!reload'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.reload,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'set-roles') === true) {
                    var split = data.message.trim().split(' ');
                    var new_config = config;
                    var new_langfile = langfile;
                    if (split.length === 1) {
                        try {
                            new_langfile = require(__dirname + '/files/language.js');
                            new_config = require(__dirname + '/config.js');
                        } catch (e) {
                            bot.sendChat(langfile.error.default);
                            return;
                        }
                        config = new_config;
                        langfile = new_langfile;
                    } else if (split.length === 2) {
                        if (split[1] === 'config') {
                            try {
                                new_config = require(__dirname + '/config.js');
                            } catch (e) {
                                bot.sendChat(langfile.error.default);
                                return;
                            }
                            config = new_config;
                        } else if (split[1] === 'lang') {
                            try {
                                new_langfile = require(__dirname + '/files/language.js');
                            } catch (e) {
                                bot.sendChat(langfile.error.default);
                                return;
                            }
                            langfile = new_langfile;
                        } else bot.sendChat(langfile.error.argument);
                    } else bot.sendChat(langfile.error.argument);
                }
            }
        });

        commands.push({
            names: ['!resetplay'],
            hidden: true,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.resetplay,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'queue-order') === true) {
                    var split = data.message.trim().split(' ');
                    if (split.length === 1) bot.sendChat(langfile.error.argument);
                    else {
                        _.rest(split, 1).forEach(function (sid) {
                            var id = parseInt(sid);
                            if (id !== undefined && isNaN(id) === false) {
                                Track.find({where: {id: id}}).then(function (track) {
                                    if (track !== undefined && track !== null) {
                                        Track.update({last_played: new Date("1990 01 01 01:01:01")}, {where: {id: track.id}});
                                        bot.sendChat(S(langfile.resetPlay.default).replaceAll('&{track}', track.name).s);
                                    } else bot.sendChat(langfile.error.track_not_found);
                                });
                            } else bot.sendChat(langfile.error.argument);
                        });
                    }
                }
            }
        });

        commands.push({
            names: ['!findtrack'],
            hidden: true,
            matchStart: true,
            enabled: true,
            desc: langfile.commanddesc.findtrack,
            handler: function (data) {
                if (bot.hasPermission(data.user, 'skip')) {
                    var split = data.message.trim().split(' ');
                    if (split.length > 1) {
                        Track.findAll({
                            where: {name: {$like: '%' + _.rest(split, 1).join(' ').trim() + '%'}},
                            order: [['id', 'ASC']],
                            limit: 15
                        }).then(function (rows) {
                            if (rows.length === 0) bot.sendChat(langfile.findtrack.notracksfound);
                            else {
                                rows.forEach(function (track) {
                                    bot.sendChat(S(langfile.findtrack.list).replaceAll('&{id}', track.id).replaceAll('&{name}', track.name).replaceAll('&{sourceid}', track.source_id).replaceAll('&{type}', track.type).replaceAll('&{length}', track.songLength).replaceAll('&{blacklisted}', track.blacklisted).s);
                                });
                            }
                        });
                    } else bot.sendChat(langfile.error.argument);
                }
            }
        });


        //dj commands
        commands.push({
            names: ['!voteskip'],
            hidden: false,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.voteskip,
            handler: function (data) {
                if (config.autoskip.resdjskip.enabled === true && data.user.role !== undefined) {
                    var staff = [];
                    bot.getStaff().forEach(function (user) {
                        if (bot.hasPermission(user, 'delete-chat') && user.id !== bot.getSelf.id) staff.push(user);
                    });

                    if (config.autoskip.resdjskip.condition.mods_online <= staff.length - 1) bot.sendChat(langfile.autoskip.resdjskip.too_many_mods);
                    else if (_.contains(skipvotes, data.user.id)) bot.sendChat(langfile.autoskip.resdjskip.already_voted);
                    else {
                        skipvotes.push(data.user.id);

                        if (skipvotes.length >= config.autoskip.resdjskip.condition.votes) {
                            bot.moderateSkip();
                            bot.sendChat(langfile.autoskip.resdjskip.skip);
                        } else bot.sendChat(S(langfile.autoskip.resdjskip.not_enough_votes).replaceAll('&{more}', config.autoskip.resdjskip.condition.votes - skipvotes.length).s);

                    }
                }
            }

        });

        //user commands
        commands.push({
            names: ['!help'],
            desc: langfile.commanddesc.help,
            handler: function () {
                if (commandtimeout.help === false) {
                    var mods = '';
                    bot.getStaff().forEach(function (mod) {
                        if (mod.id !== bot.getSelf().id) mods += '@' + mod.username + ' ';
                    });
                    if (mods.length > 2) bot.sendChat(S(langfile.help.default).replaceAll('&{mods}', mods).s);
                    else bot.sendChat(langfile.help.no_one_here);
                    commandtimeout.help = true;
                    setTimeout(function () {
                        commandtimeout.help = false
                    }, 10 * 1000);
                }
            },
            hidden: false,
            enabled: true,
            matchStart: false
        });

        commands.push({
            names: ['!callmod'],
            enabled: true,
            hidden: false,
            matchStart: true,
            desc: langfile.commanddesc.callmod,
            handler: function (data) {
                if (commandtimeout.callmod === false && config.callmod.enabled === true) {
                    if (config.callmod.service === 'slack') {
                        if (config.callmod.slack.webhookurl !== '') {
                            var split = data.message.trim().split(' ');
                            if (split.length === 1) bot.sendChat(langfile.callmod.errors.no_message);
                            else {
                                request.post(config.callmod.slack.webhookurl, {
                                    form: {
                                        payload: JSON.stringify({
                                            username: config.callmod.slack.botname || bot.getSelf().username,
                                            icon_url: config.callmod.slack.icon_url,
                                            channel: config.callmod.slack.channel,
                                            text: S(langfile.callmod.message).replaceAll('&{message}', _.rest(split, 1).join(' ').trim()).replaceAll('&{username}', data.user.username).replaceAll('&{roomname}', bot.getRoomMeta().name).s
                                        })
                                    }
                                }, function (err, req, body) {
                                    if (!err && req.statusCode === 200) {
                                        if (body == 'ok') bot.sendChat(langfile.callmod.mod_called);
                                        else bot.sendChat(langfile.callmod.errors.request);
                                    }
                                });
                            }
                        } else bot.sendChat(langfile.callmod.errors.unconfigured);
                    }
                    commandtimeout.callmod = true;
                    setTimeout(function () {
                        commandtimeout.callmod = false
                    }, 2 * 60 * 1000);
                }
            }
        });

        commands.push({
            names: ['!link'],
            handler: function () {
                if (bot.getRoomMeta().roomType === 'room') {
                    var media = bot.getMedia();
                    if (media !== undefined) {
                        if (media.type === 'youtube') {
                            bot.sendChat(S(langfile.link.default).replaceAll('&{link}', 'https://youtu.be/' + media.fkid).s);
                        } else if (media.type === 'soundcloud') {
                            request.get('http://api.soundcloud.com/tracks/' + media.fkid + '?client_id=' + config.apiKeys.soundcloud, function (err, head, body) {
                                if (!err && head.statusCode === 200) {
                                    var sdata = JSON.parse(body);
                                    bot.sendChat(S(langfile.link.default).replaceAll('&{link}', sdata.permalink_url).s);
                                } else bot.sendChat(langfile.error.default);
                            });
                        } else bot.sendChat(langfile.error.default);

                    } else bot.sendChat(langfile.link.no_media);

                } else if (bot.getRoomMeta().roomType === 'iframe') bot.sendChat(S(langfile.link.iframe).replaceAll('&{link}', bot.getRoomMeta().roomEmbed).s);
                else bot.sendChat(langfile.error.default);
            },
            hidden: false,
            enabled: true,
            matchStart: false,
            desc: langfile.commanddesc.link
        });

        commands.push({
            names: ['!define'],
            hidden: false,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.define,
            handler: function (data) {
                var msg = _.rest(data.message.split(' '), 1).join(' ').trim();
                if (msg.length > 0 && config.apiKeys.wordnik) {
                    var uri = "http://api.wordnik.com:80/v4/word.json/" + msg + "/definitions?limit=200&includeRelated=true&useCanonical=true&includeTags=false&api_key=" + config.apiKeys.wordnik;
                    request.get(uri, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var definition = JSON.parse(body);
                            if (definition.length === 0) bot.sendChat(S(langfile.define.no_definition_found).replaceAll('&{word}', msg).s);
                            else bot.sendChat(S(langfile.define.definition_found).replaceAll('&{word}', msg).replaceAll('&{definition}', definition[0].text).s);
                        }
                    });
                }
            }
        });

        commands.push({
            names: ['!duell'],
            hidden: false,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.duell,
            handler: function (data) {
                var split = data.message.trim().split(' ');
                if (_.findWhere(duells, {active: true, o_id: data.user.id}) === undefined) {
                    bot.sendChat(langfile.duell.pending_duell);
                } else if (split.length === 2) {
                    var duell = _.findWhere(duells, {active: true, c_id: data.user.id});
                    if (split[1] === 'accept') {
                        if (duell) {
                            var result = duell.start();
                            if (result.status === true) {
                                bot.sendChat(S(langfile.duell.winner).replaceAll('&{winner}', result.winner.username).replaceAll('&{loser}', result.loser.username).s);
                                bot.moderateRemoveDJ(result.loser.id);
                            } else bot.sendChat(langfile.duell.no_open_duells);
                        } else bot.sendChat(langfile.duell.no_open_duells);
                    } else if (split[1] === 'decline') {
                        if (duell) {
                            duell.setStatus(false);
                            bot.sendChat(S(langfile.duell.decline).replaceAll('&{challenged}', duell.challenged.username).s);
                        } else bot.sendChat(langfile.duell.no_open_duells);
                    } else {
                        var user = bot.getUserByName(S(split[1]).replace('@', '').s, true);
                        if (user) {
                            if (user.id === data.user.id) bot.sendChat(langfile.error.argument);
                            else if (config.points.enabled && config.points.duell_cost.enabled) {
                                User.find({where: {userid: data.user.id}}).then(function (duser) {
                                    if (duser.points - config.points.duell_cost.cost >= 0) {
                                        duells.push(new Duell(data.user, user));
                                        bot.sendChat(S(langfile.duell.start).replaceAll('&{challenged}', user.username).replaceAll('&{challenger}', data.user.username).s);
                                        points_manipulator("duell", config.points.duell_cost, [data.user]);
                                    } else bot.sendChat(S(langfile.duell.no_points).replaceAll('&{points_name}', config.points.name).s);
                                });
                            } else {
                                duells.push(new Duell(data.user, user));
                                bot.sendChat(S(langfile.duell.start).replaceAll('&{challenged}', user.username).replaceAll('&{challenger}', data.user.username).s);
                            }
                        } else bot.sendChat(langfile.error.argument);
                    }
                } else bot.sendChat(langfile.error.argument);

            }
        });

        commands.push({
            names: ['!commands'],
            hidden: false,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.commands,
            handler: function (data) {
                var split = data.message.trim().split(' ');
                if (split.length === 1) {
                    var commands_list = [];
                    _.where(commands, {hidden: false, enabled: true}).forEach(function (command) {
                        commands_list.push(command.names[0]);
                    });
                    bot.sendChat(S(langfile.commands.default).replaceAll('&{commands}', commands_list.join(', ').trim()).s);
                } else {
                    var command = commands.filter(function (cmd) {
                        var found = false;
                        for (var i = 0; i < cmd.names.length; i++) {
                            if (!found) found = (cmd.names[i] == split[1].toLowerCase() || (cmd.matchStart && split[1].toLowerCase().indexOf(cmd.names[i]) == 0));
                        }
                        return found;
                    })[0];

                    if (command && command.enabled) bot.sendChat(S(langfile.commands.desc).replaceAll('&{desc}', command.desc).replaceAll('&{alias}', command.names.join(', ').trim()).s);
                    else bot.sendChat(langfile.commands.not_found);
                }
            }
        });

        commands.push({
            names: ['!points'],
            hidden: false,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.points,
            handler: function (data) {
                if (config.points.enabled) {
                    var split = data.message.trim().split(' ');
                    if (split.length === 1) {
                        User.find({where: {userid: data.user.id}}).then(function (user) {
                            bot.sendChat(S(langfile.points.command.default).replaceAll('&{points_name}', config.points.name).replaceAll('&{amount}', user.points).s);
                        });
                    } else if (split.length === 4) {
                        var reciever = bot.getUserByName(split[2], true);
                        var amount = parseInt(split[3]);
                        if (split[1] === 'gift') {
                            if (amount && reciever && amount > 0 && reciever !== data.user && data.user)points_manipulator("gift", amount, [data.user, reciever]);
                            else if (amount && amount <= 0)bot.sendChat(S(langfile.points.command.no_negative_gift).replaceAll('&{points_name}', config.points.name).s);
                        } else if (bot.hasPermission(data.user, 'queue-order')) {
                            if (split[1] === 'add') {
                                if (amount && reciever && amount > 0) points_manipulator("award", amount, [reciever]);
                                else bot.sendChat(langfile.error.argument);
                            } else if (split[1] === 'remove') {
                                if (amount && reciever && amount > 0)points_manipulator("remove", amount, [reciever]);
                                else bot.sendChat(langfile.error.argument);
                            } else bot.sendChat(langfile.error.argument);
                        }
                    } else bot.sendChat(langfile.error.argument);
                }
            }
        });

        commands.push({
            names: ['!afkmsg'],
            hidden: false,
            enabled: true,
            matchStart: true,
            desc: langfile.commanddesc.afkmsg,
            handler: function (data) {
                if (config.afkremoval.afk_message.enabled) {
                    var split = data.message.trim().split(' ');
                    if (split.length === 2) {
                        if (split[1] === 'enable') {
                            setTimeout(function () {
                                User.update({afk_message_enabled: true}, {where: {userid: data.user.id}});
                            }, 10 * 1000);
                            bot.sendChat(S(langfile.afk_message.enabled).replaceAll('&{username}', data.user.username).s);
                        } else if (split[1] === 'clear' || split[1] === 'reset') {
                            User.update({afk_message: null}, {where: {userid: data.user.id}});
                            bot.sendChat(S(langfile.afk_message.reset).replaceAll('&{username}', data.user.username).s);
                        } else bot.sendChat(langfile.error.argument);
                    } else if (split.length > 2) {
                        if (split[1] === 'set') {
                            User.update({afk_message: _.rest(split, 2).join(' ').trim()}, {where: {userid: data.user.id}});
                            bot.sendChat(S(langfile.afk_message.message_set).replaceAll('&{message}', _.rest(split, 2).join(' ').trim()).replaceAll('&{username}', data.user.username).s);
                        } else if ((split[1] === 'reset' || split[1] === 'clear') && bot.hasPermission(data.user, 'delete-chat')) {
                            User.find({where: {username: {$like: '%' + S(split[2]).chompLeft('@').s + '%'}}}).then(function (user) {
                                if (user !== undefined && user !== null) {
                                    User.update({afk_message: null}, {where: {id: user.id}});
                                    bot.sendChat(S(langfile.afk_message.mod_reset).replaceAll('&{username', user.username).s);
                                } else bot.sendChat(langfile.error.argument);
                            });
                        } else bot.sendChat(langfile.error.argument);
                    } else bot.sendChat(langfile.error.argument);
                }
            }
        });
    }

    function timings() {

        if (config.afkremoval.enabled === true) {
            afkcheck();
            if (config.afkremoval.kick === true) kickforafk();
            warnafk();
            removeafk();
        }
        if (config.queuecheck.enabled === true) checkQueue(bot.getQueue());
        if (config.options.random_messages) {
            RandomMessage.findAll({where: {status: true}}).then(function (rows) {
                if (rows.length !== 0) bot.sendChat(rows[_.random(0, rows.length - 1)].message);
            });
        }

        var minutes = _.random(2, 10);
        autotimer = setTimeout(function () {
            timings();
        }, minutes * 60 * 1000);
        console.log('[INFO] Executed timings, next execution in ' + minutes + ' minutes.');
    }

    function afkcheck() {
        bot.getUsers().forEach(function (user) {
            User.find({where: {userid: user.id}}).then(function (row) {
                var now = moment();
                if (row !== undefined && row !== null) {
                    if (now.diff(row.last_active, 'seconds') > config.afkremoval.timeout) User.update({afk: true}, {where: {userid: user.id}});
                }
            });
        });
    }

    function warnafk() {
        User.findAll({where: {afk: true, warned_for_afk: false}}).then(function (users) {
            var afks = [];
            var queue = bot.getQueue();
            users.forEach(function (user) {
                if (_.contains(queue, bot.getUser(user.userid))) {
                    afks.push('@' + user.username);
                    User.update({warned_for_afk: true}, {where: {id: user.id}});
                }
            });
            if (afks.length !== 0) bot.sendChat(afks.join(' ').trim() + langfile.afk.warning);
        });
    }

    function removeafk() {
        User.findAll({where: {warned_for_afk: true}}).then(function (users) {
            var afks = [];
            var queue = bot.getQueue();
            users.forEach(function (user) {
                if (_.contains(queue, bot.getUser(user.userid))) {
                    afks.push('@' + user.username);
                    if (config.afkremoval.action === "REMOVEDJ") bot.moderateRemoveDJ(user.userid);
                    else if (config.afkremoval.action === "PAUSEUSERQUEUE") bot.moderatePauseDj(user.userid);
                    User.update({removed_for_afk: true}, {where: {id: user.id}});
                }
            });

            if (afks.length !== 0) bot.sendChat(afks.join(' ').trim() + langfile.afk.remove);
        });
    }

    function kickforafk() {
        User.findAll({where: {removed_for_afk: true}}).then(function (users) {
            var afks = [];
            var afk_names = [];
            var queue = bot.getQueue();
            users.forEach(function (user) {
                if (_.contains(queue, bot.getUser(user.userid)) && bot.hasPermission(bot.getUser(user.userid), 'queue-order') === false) {
                    afks.push(bot.getUser(user.userid));
                    afk_names.push('@' + user.username);
                }
            });

            if (afks.length > 0) {
                bot.sendChat(afk_names.join(' ').trim() + langfile.afk.kick);

                afks.forEach(function (user) {
                    if (bot.isStaff(user)) {
                        var role = user.role;
                        bot.moderateUnsetRole(user.id, role, function (err) {
                            if (!err) {
                                bot.moderateKickUser(user.id, langfile.afk.kick_msg, function (err) {
                                    if (!err)bot.moderateSetRole(user.id, role);
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    function checksong(media, playid) {
        if (media.songLength > config.autoskip.timelimit.limit * 1000 && config.autoskip.timelimit.enabled) {
            bot.moderateSkip();
            bot.sendChat(langfile.autoskip.timelimit.default);
        } else {
            var trackdata = {
                name: media.name,
                dub_id: media.id,
                type: media.type,
                source_id: media.fkid,
                thumbnail: media.thumbnail,
                songLength: media.songLength
            };

            Track.findOrCreate({
                where: {dub_id: trackdata.dub_id},
                defaults: trackdata
            }).then(function (trackl, created) {
                if (!created && bot.getPlayID() === playid) {
                    var track = trackl[0];
                    var dj = bot.getDJ();
                    if (track.blacklisted) {
                        bot.moderateSkip();
                        if (track.bl_reason !== undefined && track.bl_reason !== null) bot.sendChat(S(langfile.blacklisted.is_blacklisted).replaceAll('&{track}', track.name).replaceAll('&{dj}', dj.username).replaceAll('&{reason}', track.bl_reason).s);
                        else bot.sendChat(S(langfile.blacklisted.is_blacklisted).replaceAll('&{track}', track.name).replaceAll('&{dj}', dj.username).s);
                    } else if (config.autoskip.history.enabled === true && moment().diff(track.last_played, 'minutes') < config.autoskip.history.time && track.last_played !== undefined) {
                        bot.moderateSkip();
                        bot.sendChat(S(langfile.autoskip.history).replaceAll('&{username}', dj.username).replaceAll('&{track}', track.name).s);
                    }
                    /*track.getLabels().then(function (tracks) {
                     if (playid === bot.getPlayID()) {
                     var moderated = false;
                     tracks.forEach(function (trck) {
                     if(moderated === false){
                     if (config.autoskip.history.enabled === true && moment().diff(trck.last_played, 'minutes') < config.autoskip.history.time && trck.last_played !== undefined) {
                     bot.moderateSkip();
                     bot.sendChat(langfile.autoskip.history);
                     moderated = true;
                     }
                     }
                     });
                     }
                     });*/
                }
            });
        }
    }

    function checkQueue(queue) {
        queue.forEach(function (queueobject, index) {
            if (queueobject.media.songLength > config.autoskip.timelimit.limit * 1000 && config.autoskip.timelimit.enabled) {
                if (config.queuecheck.action === 'REMOVESONG') bot.moderateRemoveSong(queueobject.user.id);
                else if (config.queuecheck.action === 'REMOVEDJ') bot.moderateRemoveDJ(queueobject.user.id);
                else if (config.queuecheck.action === 'PAUSEUSERQUEUE') bot.moderatePauseDj(queueobject.user.id);
                bot.sendChat(S(langfile.queuecheck.length).replaceAll('&{username}', queueobject.user.username).s);
            } else {
                QueueBan.find({where: {dub_user_id: queueobject.user.id, active: true}}).then(function (ban) {
                    if (ban !== undefined && ban !== null) {
                        bot.moderateRemoveDJ(ban.dub_user_id);
                        if (ban.reason !== null && ban.reason !== undefined) bot.sendChat(S(langfile.queueban.banned_reason).replaceAll('&{username}', queueobject.user.username).replaceAll('&{reason}', ban.reason).s);
                        else bot.sendChat(S(langfile.queueban.banned).replaceAll('&{username}', queueobject.user.username).s);
                    } else {
                        var trackdata = {
                            name: queueobject.media.name,
                            dub_id: queueobject.media.id,
                            type: queueobject.media.type,
                            source_id: queueobject.media.fkid,
                            thumbnail: queueobject.media.thumbnail,
                            songLength: queueobject.media.songLength
                        };

                        Track.findOrCreate({
                            where: {dub_id: queueobject.media.id},
                            defaults: trackdata
                        }).then(function (tracks, created) {
                            var track = tracks[0];
                            if (!created && bot.getQueue()[index].media.id === track.id) {
                                if (track.blacklisted) {
                                    if (config.queuecheck.action === 'REMOVESONG') bot.moderateRemoveSong(queueobject.user.id);
                                    else if (config.queuecheck.action === 'REMOVEDJ') bot.moderateRemoveDJ(queueobject.user.id);
                                    else if (config.queuecheck.action === 'PAUSEUSERQUEUE') bot.moderatePauseDj(queueobject.user.id);
                                    if (track.bl_reason !== undefined && track.bl_reason !== null) bot.sendChat(S(langfile.queuecheck.blacklisted_reason).replaceAll('&{username}', queueobject.user.username).replaceAll('&{track}', track.name).replaceAll('&{reason}', track.bl_reason).s);
                                    else bot.sendChat(S(langfile.queuecheck.blacklisted).replaceAll('&{username}', queueobject.user.username).replaceAll('&{track}', track.name).s);
                                } else if (config.autoskip.history.enabled === true && moment().diff(track.last_played, 'minutes') < config.autoskip.history.time && track.last_played !== undefined) {
                                    if (config.queuecheck.action === 'REMOVESONG') bot.moderateRemoveSong(queueobject.user.id);
                                    else if (config.queuecheck.action === 'REMOVEDJ') bot.moderateRemoveDJ(queueobject.user.id);
                                    else if (config.queuecheck.action === 'PAUSEUSERQUEUE') bot.moderatePauseDj(queueobject.user.id);
                                    bot.sendChat(S(langfile.queuecheck.history).replaceAll('&{username}', queueobject.user.username).replaceAll('&{track}', track.name).s);
                                }

                                //todo add label when working
                            }
                        });
                    }
                });
            }
        });
    }

    function cleanchat(userid) {
        if (typeof userid === 'string') {
            bot.getChatHistory().forEach(function (chat) {
                if (chat.user.id === userid) {
                    setTimeout(function () {
                        bot.moderateDeleteChat(chat.id);
                    }, _.random(2, 4) * 1000);
                }
            });
        }
    }

    function points_manipulator(action, amount, users) {
        if (typeof action !== 'string' || typeof amount !== 'number') return;
        switch (action) {
            case "award":
                if (users.length === 1) {
                    User.find({where: {userid: users[0].id}}).then(function (user) {
                        User.update({points: user.points + amount}, {where: {id: user.id}});
                        bot.sendChat(S(langfile.points.award).replaceAll('&{points_name}', config.points.name).replaceAll('&{username}', user.username).replaceAll('&{amount}', amount).s);
                    });
                }
                break;
            case "remove":
                if (users.length === 1) {
                    User.find({where: {userid: users[0].id}}).then(function (user) {
                        User.update({points: user.points - amount}, {where: {id: user.id}});
                        bot.sendChat(S(langfile.points.remove).replaceAll('&{points_name}', config.points.name).replaceAll('&{username}', user.username).replaceAll('&{amount}', amount).s);
                    });
                }
                break;
            case "gift":
                if (users.length === 2) {
                    User.find({where: {userid: users[0].id}}).then(function (gifter) {
                        if (gifter.points - amount > -1) {
                            User.find({where: {userid: users[1].id}}).then(function (reciever) {
                                User.update({points: gifter.points - amount}, {where: {id: gifter.id}});
                                User.update({points: reciever.points + amount}, {where: {id: reciever.id}});
                                bot.sendChat(S(langfile.points.command.gift).replaceAll('&{points_name}', config.points.name).replaceAll('&{amount}', amount).replaceAll('&{gifter}', gifter.username).replaceAll('&{reciever}', reciever.username).s);
                            });
                        } else bot.sendChat(S(langfile.points.command.gift_failed).replaceAll('&{points_name}', config.points.name).s);

                    });
                }
                break;
            case "duell":
                if (users.length === 1) {
                    User.find({where: {userid: users[0].id}}).then(function (user) {
                        user.update({points: user.points - amount}, {where: {id: user.id}});
                    });
                }
                break;
            default:
                break;
        }
    }

    function deleteChatMessage(chatid, history) {
        var pos = _.findIndex(history, {id: chatid});
        if (history[pos - 1] !== undefined) {
            if (history[pos - 1].user.id === history[pos].user.id) {
                deleteChatMessage(history[pos - 1].id, history);
            }
            else bot.moderateDeleteChat(chatid);
        } else {
            bot.moderateDeleteChat(chatid);
        }
    }


    function queuePlaylist(playlistid) {
        bot._.reqHandler.queue({
            method: 'POST',
            url: 'https://api.dubtrack.fm/room/%RID%/queueplaylist/' + playlistid
        }, function (err) {
            return !err;
        })
    }

    function clearQueue() {
        bot._.reqHandler.queue({
            method: 'DELETE',
            url: 'https://api.dubtrack.fm/user/session/room/%RID%/queue/order'
        }, function (err) {
            return !err;
        });
    }

    function shufflePlaylist() {
        bot._.reqHandler.queue({
            method: 'ORDER',
            url: 'https://api.dubtrack.fm/user/session/room/%RID%/queue/order'
        }, function (err) {
            return !err;
        });
    }
});

