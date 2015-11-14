var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var request = require('request');
var Sequelize = require('sequelize');
var Promise = require('bluebird');

var config = require(__dirname + '/config.json');

sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
    dialect: 'mysql',
    host: config.db.host,
    port: config.db.port
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

app.get('/blacklist', function(req, res){
  fs.readFile(__dirname + '/files/blacklist.html', 'utf8', function(err, file){
    if(!err){
      Track.findAll({where: {blacklisted: true}}).then(function(rows){
        var message = '';
        rows.forEach(function(track){
          var link = '-';
          if(track.type === 'youtube'){
            var arr = track.thumbnail.split('/');
            var link = '<a href="https://youtu.be/' + arr[4] + '">Link</a>';
          }
          message += '<tr><th align="center">' + track.dataValues.id + '</th><th align="center">' + track.dataValues.name + '</th><th align="center">' + track.dataValues.type + '</th><th align="center">' + track.dataValues.songLength / 1000 + ' Seconds</th><th align="center">' + link + '</th><th align="center"><img src="' + track.dataValues.thumbnail + '" style="width:150px;height:100px"</th></tr>';
        });
        res.send(S(file).replaceAll('${blacklist}$', message).s);
      });
    } else {
      res.send('Missing blacklist.html');
    }
  });
});

app.get('/stats.json', function(req, res){
  res.sendFile(__dirname + '/stats.json');
});

app.get('/*', function(req, res){
  res.redirect(302, '/blacklist');
});

http.listen(config.options.http_port, function(){console.log('Listening on ' + config.http_port);});
