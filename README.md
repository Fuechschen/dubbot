# dubbot
Prototype of an bot for dubtrack

### Functionality

Since this is currently only a prototype, there aren't much features now, but they will be added soon when a full documented api dubtrack is out. Currently, the bot is capable of blacklisting and skipping songs.

A full list of commands can be found here: https://fuechschen.info/fuchsbot/

### Requirements

This bot requires node.js and phantomjs in version 2.0 or higher for dubtrackapi. The easiest way to install node on debian/ubuntu is to just run ```apt-get install node``` as root. For phantomjs, there is currently no precompiled package available. Follow the instructions [here](http://phantomjs.org/build.html) to install it on your system.

You will need an account at dubtrack with at least VIP-Permission in your room and E-Mail as login method.

Just to complete the requirements: [dubtrackapi](https://github.com/Fuechschen/dubtrackapi) in my own, modified version is needed.


### Installation

1. Make sure you have [phantomjs](http://phantomjs.org/) installed.
2. Clone this repo.
3. Run ```npm install``` in the folder of this repo.
4. Create a MySql-Database and run install.sql found in the install folder for this database.
5. Copy config.json.example from the install folder to the root folder of this repo (the folder bot.js can be found in) and fill it with your data
6. Run bot.js with ```node bot.js```

### PM2

I'm suggesting to use pm2 to run this bot. Install it with ```npm install pm2```, then run the bot with ```pm2 start bot.js```.
If you want to let the bot autostart with the server running it, follow these steps:
1. ```pm2 autostart``` to configure autostart for pm2
2. Then start your bot (if its not already running) with ```pm2 start bot.js```
3. Now run ```pm2 save``` to save the process.
4. Finished!


### Info

Feel free to add features your own or to request them. If you are submiting a pull request, be sure it's only containing one or two commits. You can submit more pull request anytime.

Since this project is still under developement, there are maybe some dependencies in package.json that are currently not needed.


### Credits

I would like to thank the following people for their inspirations to this project:

1. [avatarkava](https://github.com/avatarkava) and his beavisBot for being the main inspiration.
2. [atomjack](https://github.com/atomjack) for developing dubtrackapi.


### Disclaimer

This software is provided "as is". You are free to use it as the license allows is, but every use is at your own risk. I am not liable for any claim, damage or anything other this software is causing.

I'm trying to deliver the best support i can for this, but since i'm only a human, answering may take a while.
