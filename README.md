# dubbot [![Dependency Status](https://david-dm.org/Fuechschen/dubbot.svg?style=flat-square)](https://david-dm.org/Fuechschen/dubbot) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/Fuechschen/dubbot/master/LICENSE) [![SonarQube Tech Debt](https://img.shields.io/sonar/http/sonar.fuechschen.org/dubbot/tech_debt.svg?style=flat-square)](https://sonar.fuechschen.org/dashboard/index/1)

A (simple) bot for dubtrack running with node.js 

### Functionality

Since dubbot is still under development, there will be features added in future. The current functions are:

* Skipping
* Blacklisting
* Chat Logging
* Custom Text Chat Triggers
* Afk-Removal
* Experimental chat- and spamfilter
* History Skipping
* Ban users from joining the queue

A full list of commands can be found [here](/docs/commands.md).

### Requirements

This bot requires node.js. Install it on Ubuntu/Debian with ```apt-get install node```

You will need an account at dubtrack with at least VIP-Permission in your room and E-Mail as login method.

Also, a mysql, postgresql or a sqlite db is required.



### Installation

1. Clone this repo.
2. Run ```npm install``` in the folder of this repo.
3. Create a Database and ensure dubbot's host can connect to it.
4. Rename config.example.js to config.js and fill in you data. ([How to get the API-Keys](/docs/keys.md))
5. Run bot.js with ```node bot.js```

#### Language

The language can be easily modified by translating files/language.js. Remember to update it when updateing the bot!


### PM2

I'm suggesting to use pm2 to run this bot. Install it with ```npm install pm2```, then run the bot with ```pm2 start bot.js```.

If you want to let the bot autostart with the server running it, follow these steps:

1. ```pm2 autostart``` to configure autostart for pm2
2. Then start your bot (if its not already running) with ```pm2 start bot.js```
3. Now run ```pm2 save``` to save the process.
4. Finished!


### Credits

I would like to thank the following people for their inspirations to this project:

1. [avatarkava](https://github.com/avatarkava) and his beavisBot for being the main inspiration.
2. [anjanms](https://github.com/anjanms) for developing DubAPI.


### Disclaimer

This software is provided "as is". You are free to use it as the license allows it, but every use is at your own risk. I am not liable for any claim, damage or anything other this software is causing.

I'm trying to deliver the best support i can for this, but since i'm only a human, answering may take a while.
