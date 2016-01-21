var _ = require('underscore');
var S = require('string');
var moment = require('moment');

var _id;
var time;
var lmessage;
var score;
var spamwarnings;
var muted;

function SpamProtection(userid, message) {
    this._id = userid;
    this.time = moment();
    this.lmessage = message;
    this.score = 1;
    this.spamwarnings = 0;
    this.muted = false;
}

SpamProtection.prototype.getScore = function () {
    return this.score;
};

SpamProtection.prototype.getWarnings = function () {
    return this.spamwarnings;
};

SpamProtection.prototype.increaseScore = function (count) {
    if (count === undefined || count === null) {
        count = 1;
    }
    this.score = this.score + count;
};

SpamProtection.prototype.updateMessage = function (message) {
    this.lmessage = message;
    this.time = moment();
};

SpamProtection.prototype.checkforspam = function (message) {
    if (message === this.lmessage) {
        if (moment().diff(this.time, 'seconds') <= 5) {
            return true;
        }
    } else if (moment().diff(this.time, 'seconds') <= 1) {
        return true;
    } else {
        return false;
    }
};

SpamProtection.prototype.increaseSpamWarnings = function (count) {
    if (count === null || count === undefined) {
        count = 1;
    }
    this.spamwarnings = this.spamwarnings + count;
};

SpamProtection.prototype.setMuted = function (state) {
    this.muted = state;
};

SpamProtection.prototype.getMuted = function () {
    return this.muted;
};

SpamProtection.prototype.reset = function () {
    this.score = 1;
    this.spamwarnings = 0;
};

module.exports = SpamProtection;
