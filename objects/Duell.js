var _ = require('underscore');

function Duell(challenger, challenged) {
    this.challenger = challenger;
    this.challenged = challenged;
    this.c_id = challenged.id;
    this.o_id = challenger.id;

    this.active = true;

    setTimeout(function () {
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.active = false;
    }, 5 * 60 * 1000);
}

Duell.prototype.start = function () {
    if (this.active) {
        var rand = _.random(1, 1000);
        if (rand % 2 === 0) return {winner: this.challenged, loser: this.challenger, status: true};
        else return {winner: this.challenger, loser: this.challenged, status: true}
    } else return {status: false};
};

Duell.prototype.setStatus = function (status) {
    this.active = status;
};

module.exports = Duell;
