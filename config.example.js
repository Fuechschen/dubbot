module.exports = {
    login: {
        username: "", //Login-name or e-mail here
        password: "" //Obvious, right?
    },
    options: {
        room: "", //the thing behind https://www.dubtrack.fm/join/
        customtext_trigger: ".",
        welcome_users: true,     //welcome users or not
        room_state_file: true,  // wether to generate stats.json or not
        random_messages: true     //send a random messages all 2-10 minutes, see !rndmsg
    },
    db: {   //your db config, fill in the path to database when usind sqlite (which is not recommended due to performance)
        dialect: "",
        database: "",
        username: "",
        password: "",
        host: "",
        port: "3306"
    },
    autoskip: {
        history: {
            enabled: true,
            labeled: true,
            time: 120   //time in minutes
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
        action: "REMOVESONG"    //"REMOVESONG" for removeing only the song, "REMOVEDJ" to remove the dj
    },
    afkremoval: {
        enabled: true,
        timeout: 3600,   //time in seconds
        kick: true,
        chat_ignore_phrase: "[AFK]"   //bot will ignore messages that include this
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
        dubtrackroom: true,    //dubtrack-room-urls will be automatically deleted
        youtube: true,         //youtube-urls will be blocked
        word_blacklist: {      //blacklist for words
            enabled: false,
            words: []
        },
        spam: {
            enabled: true,
            aggressivity: {
                delete: 5,  //how many positive spam resultis till messages are deleted
                mute: 2     // how many times a the bot deletes messages before muting
            },

        },
        link_protection: {  //prevents users who just joind from posting links in chat
            enabled: true,
            timeout: 5       //minutes till users can post links
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
        enabled: true,
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
            msg: "@&{dj} Your is overplayed."
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
    }
};
