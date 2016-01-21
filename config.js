module.exports = {
    "login": {
        "username": "fuchsbot",
        "password": "Maxplanck2011"
    },
    "options": {
        "room": "nullcraft",
        "customtext_trigger": ".",
        "welcome_users": true,
        "http_port": 3000,
        "room_state_file": true,
        random_messages: true
    },
    "db": {
        "dialect": "mysql",
        "database": "fuchsbot_dev",
        "username": "fuchsbot_dev",
        "password": "2oL2tO",
        "host": "hoellenfuchs.fuechschen.org",
        "port": "3306"
    },
    "autoskip": {
        "history": {
            "enabled": true,
            "labeled": true,
            "time": 120
        },
        "timelimit": {
            "enabled": true,
            "limit": 600
        },
        "votes": {
            "enabled": true,
            "condition": {min: 2, max: 15, ratio: 0.1}
        }
    },
    "afkremoval": {
        "enabled": true,
        "timeout": 3600,
        "kick": true,
        "chat_ignore_phrase": "I am AFK at the moment"
    },
    "cleverbot": {
        "enabled": true
    },
    "apiKeys": {
        "wordnik": "74debd5789bc09bee500e0236b2076ebc86c8cfa881715a56",
        "soundcloud": "d77e72464690eebf8501fd2b47bab662"
    },
    "chatfilter": {
        "enabled": false,
        "dubtrackroom": true,
        "youtube": true,
        "word_blacklist": {
            "enabled": false,
            "words": []
        },
        "spam": {
            "enabled": true,
            "aggressivity": {
                "delete": 5,
                "mute": 2
            }
        }
    },
    "restorePositions": {
        "enabled": true
    }
};
