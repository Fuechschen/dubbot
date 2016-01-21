module.exports = {
    "login": {
        "username": "", //Login-name or e-mail here
        "password": "" //Obvious, right?
    },
    "options": {
        "room": "", //the thing behind https://www.dubtrack.fm/join/
        "customtext_trigger": ".",
        "welcome_users": true,     //welcome users or not
        "room_state_file": true,  // wether to generate stats.json or not
        random_messages: true     //send a random messages all 2-10 minutes, see !rndmsg
    },
    "db": {   //your db config, fill in the path to database when usind sqlite (which is not recommended due to performance)
        "dialect": "",
        "database": "",
        "username": "",
        "password": "",
        "host": "",
        "port": "3306"
    },
    "autoskip": {
        "history": {
            "enabled": true,
            "labeled": true,
            "time": 120   //time in minutes
        },
        "timelimit": {
            "enabled": true,
            "limit": 600   //time in seconds
        },
        "votes": {
            "enabled": true,
            "condition": {min: 2, max: 15, ratio: 0.1}   //put a number, an object looking like this or a function here (function gets {updubs, downdubs, usercout, users, staff} as an object. return true to skip).
        }
    },
    "afkremoval": {
        "enabled": true,
        "timeout": 3600,   //time in seconds
        "kick": true,
        "chat_ignore_phrase": "[AFK]"   //bot will ignore messages that include this
    },
    "cleverbot": {    //config if the bot speaks when mentioned
        "enabled": true
    },
    "apiKeys": {
        "wordnik": "",      //wordnik api-key for !define
        "soundcloud": ""    //soundcloud-api-key, required for !link with soundcloud-tracks
    },
    "chatfilter": {
        "enabled": true,
        "dubtrackroom": true,    //dubtrack-room-urls will be automatically deleted
        "youtube": true,         //youtube-urls will be blocked
        "word_blacklist": {      //blacklist for words
            "enabled": false,
            "words": []
        },
        "spam": {
            "enabled": true,
            "aggressivity": {
                "delete": 5,  //how many positive spam resultis till messages are deleted
                "mute": 2     // how many times a the bot deletes messages before muting
            }
        }
    }
};
