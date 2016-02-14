module.exports = {
    login: {
        username: "", //Login-name or e-mail here
        password: "" //Obvious, right?
    },
    options: {
        room: "", //the thing behind https://www.dubtrack.fm/join/
        customtext_trigger: ".",    //literal to trigger custom texts
        welcome_users: true,     //welcome users or not
        room_state_file: true,  // wether to generate stats.json or not
        random_messages: true,     //send a random messages all 2-10 minutes, see !rndmsg
        upvote: false,              //upvote every song
        custom_command_list: true   //generates the command list for every user based on permission, this ignores hidden commands
    },
    db: {   //your db config, fill in the path to database when usind sqlite (which is not recommended due to performance) Refer to http://sequelize.readthedocs.org/en/latest/api/sequelize/ for other dialects.
        dialect: "mysql",   //dialect for the db connection, required to run (remember to install the required packages if you are using something else than mysql/mariadb
        database: "",       //name og the database, required to run
        username: "",
        password: "",
        host: "",
        port: "3306"
    },
    autoskip: {
        history: {
            enabled: true,
            time: 120,   //time in minutes
            move_to: 2   //moves skipped djs back to this position, set to -1 to disable
        },
        timelimit: {
            enabled: true,
            limit: 600   //time in seconds
        },
        votes: {
            enabled: true,
            condition: {min: 2, max: 15, ratio: 0.1}   //put a number, an object looking like this or a function here (function gets {updubs, downdubs, usercout, users, staff} as an object. return true to skip).
        },
        stucksongs: {    //skips songs if they aren't skipping automaitcally after their end
            enabled: true
        },
        resdjskip: {    //let your resdj/dj vote for a skip when not enough staff memebers are online
            enabled: false,
            condition: {
                mods_online: 2,     //the amount of mods to be online to disable resdjskip only mod+ counted
                votes: 2            //amout of votes for a skip
            }
        }
    },
    queuecheck: {    //checks the queue for blacklisted/recently played songs and removes them
        enabled: true,
        action: "REMOVESONG"    //"REMOVESONG" for removing only the song, "REMOVEDJ" to remove the dj, "PAUSEUSERQUEUE" to remove the DJ without clearing his queue
    },
    afkremoval: {
        enabled: true,
        timeout: 3600,   //time in seconds
        kick: true,
        kick_ignore_permission: 'skip',  //Permission to not be kicked for being afk
        chat_ignore_phrase: "[AFK]",   //bot will ignore messages that include this
        action: "REMOVEDJ",  //"REMOVEDJ" to remove the dj and clear his queue, "PAUSEUSERQUEUE" to remove the DJ without clearing his queue
        afk_message: {       //activate integrated afk message
            enabled: true
        }
    },
    cleverbot: {    //config if the bot speaks when mentioned
        enabled: true
    },
    apiKeys: {
        wordnik: "",      //wordnik api-key for !define
        soundcloud: ""    //soundcloud-api-key, required for !link with soundcloud-tracks
    },
    chatfilter: {
        enabled: true,
        dubtrackroom: true,    //dubtrack-room-urls will be blocked
        youtube: true,         //youtube-urls will be blocked
        word_blacklist: {      //blacklist for words
            enabled: false,
            words: []
        },
        spam: {
            enabled: false,    //enable this on your own risk, it's (maybe) a bit too aggressive,
            aggressivity: {
                delete: 5,  //how many positive spam resultis till messages are deleted
                mute: 2     // how many times a the bot deletes messages before muting
            }
        },
        link_protection: {  //prevents users who just joind from posting links in chat
            enabled: true,
            timeout: 5       //minutes till users can post links
        },
        images: {            //delete images from chat WARNING: may also deletes messages before image
            enabled: false,
            timeout: 60,     //seconds before images is deleted, set to 0 if images should be blocked completely
            regex: /http(|s):\/\/.+\.(png|jpg|jpeg|gif)/i     //regex to detect images, only edit if you know what you are doing
        }
    },
    autodj: {     //bot automatically joins the queue when too short
        enabled: false,
        limits: {
            min: 1,   //min queue lenght to let the bot join
            max: 2    //max queue lenght without the bot to let the bot leave the queue
        },
        playlistid: ''  //id of the playlist to queue
    },
    callmod: {     //calls a mod through a webservice
        enabled: false,
        service: 'slack',    //only slack currently supported
        slack: {
            webhookurl: '',     //webhookurl for slack
            channel: undefined,  //slackchannel to post
            botname: undefined,  //change the name of the bot in slack
            icon_url: undefined  // set an icon for the bot
        }
    },
    skipreasons: [     //set available skip-reasons for !skip
        {
            reason: "u",
            msg: "@&{dj} Your song wasn't available."
        },
        {
            reason: "o",
            msg: "@&{dj} Your song is overplayed."
        },
        {
            reason: "h",
            msg: "@&{dj} Your song was already played recently."
        },
        {
            reason: "t",
            msg: "@&{dj} Your song doesn't fit the theme."
        },
        {
            reason: "n",
            msg: "@&{dj} Your song wasn't safe for work!"
        },
        {
            reason: "q",
            msg: "@&{dj} Your song had a bad quality."
        }
    ],
    pm2: {   //restart over pm2 (!restart)
        enabled: false,    //only enable this when you are using pm2
        processname: 'bot'   //the processname of the bot (you also use the processid here)
    },
    duell: {      //enable/disbale duells
        enabled: true
    },
    points: {     //settings for the points system
        enabled: false,
        name: "points",   //name for the currency, emotes can be used
        lottery: true,     //set points for winning the lottery
        lottery_reward: 1,
        roulette: true,     //set points for winning roulette
        roulette_reward: 1,
        points_duell: true,   //set points for winning a duell
        duell_reward: 2,
        duell_cost: {         //set cost for starting a duell
            enabled: true,
            cost: 2
        }
    },
    automation: {
        delete_chat: {
            mute: true,    //delete users chat if muted
            kick: true     //delete users chat if kicked
        }
    }
};
