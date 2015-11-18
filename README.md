# dubbot
A (simple) bot for dubtrack running with node.js

### Functionality

Since dubbot is still under development, there will be features added in future. The current functions are:

* Skipping
* Blacklisting
* Chat Logging
* Custom Text Chat Triggers
* Afk-Removal

A full list of commands can be found here: https://dubbot.net/commands

### Requirements

This bot requires node.js. Install it on Ubuntu/Debian with ```apt-get install node```

You will need an account at dubtrack with at least VIP-Permission in your room and E-Mail as login method.



### Installation

1. Clone this repo.
2. Run ```npm install``` in the folder of this repo.
3. Create a MySql-Database and run install.sql or install_with_predefined_ct.sql (only run one of them)* found in the install folder for this database.
4. Copy config.json.example from the install folder to the root folder of this repo (the folder bot.js can be found in), rename it to config,json and fill it with your data
5. Run bot.js with ```node bot.js```
6. If you want to see your blacklists, also run web.js with ```node web.js```, The viewer is now available under ```http://localhost:3000/blacklist```.

`*` install_with_predefined_ct.sql adds .bot and .commands as customtexts

#### Language

DubBot's messages can be easily modified by providing a language file in the config.json. Fill in ```en``` for the default english language file or ```de``` for the default german language file. You can also provide your own language by just filling in a url which delivers a json-file looking like this: https://cdn.dubbot.net/files/language/english.json

If you don't want to host it, you can use the file given in files/language.json. Just insert an invalid url in config,json at the language_file-option.

If you are using your own file, remember to update it when updating the bot.

#### Labels

Labels are an easy way to connect diffrent version of songs in groups. If one song in this group is blacklist, every song in this group will be skipped. You can add a label to the actual song with ```!slbl (label)``` or overide the label of the actual song with ```!olbl (label)```.

Labels are strings without any spaces.

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
