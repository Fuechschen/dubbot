var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var _ = require('underscore');
var S = require('string');
var request = require('request');
var Sequelize = require('sequelize');
var Promise = require('bluebird');

path = require('path');

var config = require(path.resolve(__dirname, 'config.json'));

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
  console.log('Sending blacklists!');
  Track.findAll({where: {blacklisted: true}}).then(function(rows){
    var message = '<!DOCTYPE html><html lang="en-us"><head><title>Blacklists</title><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"><link rel="stylesheet" type="text/css" href="https://cdn.dubbot.net/css/pluginfo/normalize.css" media="screen"><link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css"><link rel="stylesheet" type="text/css" href="https://cdn.dubbot.net/css/pluginfo/stylesheet.css" media="screen"><link rel="stylesheet" type="text/css" href="https://cdn.dubbot.net/css/pluginfo/gh.css" media="screen"></head><body><section class="main-content"><h2><a id="blacklist" class="anchor" href="#blacklist" aria-hidden="true"><span class="octicon octicon-link"></span></a>Blacklist</h2>' + '<table><thead><tr><th align="center">ID</th><th align="center">Title</th><th align="center">Type</th><th align="center">Lenght</th><th align="center">Thumbnail</th></tr></thead><tbody>';
    rows.forEach(function(track, index, array){
      message += '<tr><th align="center">' + track.dataValues.id + '</th><th align="center">' + track.dataValues.name + '</th><th align="center">' + track.dataValues.type + '</th><th align="center">' + track.dataValues.songLength + '</th><th align="center">' + track.dataValues.thumbnail + '</th></tr>';
    });
    res.send(message + '</tbody></table></section></body></html>');
  });
});

http.listen(config.http_port, function(){console.log('Listening on ' + config.http_port);});
