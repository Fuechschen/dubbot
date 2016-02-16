var moment = require('moment');

function SpamProtection(userid) {
    this._id = userid;
    this.score = 1;
    this.spamwarnings = 0;
    this.muted = false;
    this.postLinks = true;
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
        if (moment().diff(this.time, 'seconds') <= 1) return true;
    } else return moment().diff(this.time, 'seconds') <= 6;
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

SpamProtection.prototype.isMuted = function () {
    return this.muted;
};

SpamProtection.prototype.reset = function () {
    this.score = 1;
    this.spamwarnings = 0;
};

SpamProtection.prototype.canpostLinks = function () {
    return this.postLinks;
};

SpamProtection.prototype.setpostLink = function (bool) {
    this.postLinks = bool;
};

module.exports = SpamProtection;
