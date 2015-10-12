# dubbot
Prototype of an bot for dubtrack

### Installation

1. Make sure you have [phantomjs](http://phantomjs.org/) installed.
2. Clone this repo.
3. Run ```npm install``` in the folder of this repo.
4. Create a MySql-Database and run install.sql found in the install folder for this database.
5. Copy config.json.example from the install folder to the root folder of this repo (the folder bot.js can be found in) and fill it with your data
6. Run bot.js with ```node bot.js```

### PM2

I'm suggesting to use pm2 to run this bot. Install it with ```npm install pm2```, then run the bot with ```pm2 start bot.js```.
If you want to let the bot autostart with the server running it, run the following commands:
1. ```pm2 autostart``` to configure autostart for pm2
2. Then start your bot (if its not already running) with ```pm2 start bot.js```
3. Now run ```pm2 save``` to save the process.
4. Finished!
