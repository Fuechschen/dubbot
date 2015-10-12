exports.names = ['!csi', '!panda', '!luma', '!dasluemchen', '!fuchs', '!fox', '!fuechschen', '!aninight', '!ani'];
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, bot) {
    if(data.message === '!csi'){
		bot.chat('dons sunglasses....');
        bot.chat('http://media1.giphy.com/media/v9rfTQBNqdsSA/giphy.gif');
		setTimeout(function () {
			bot.chat('YEAAAAAHHHHHHHHHHHHHHHHHHHHHHH');
		}, 3000);
	}else if(data.message === '!fuchs' || data.message === '!fox' || data.message === '!fuechschen'){
		bot.chat('http://orig04.deviantart.net/74e8/f/2012/251/0/6/dj_fox__by_leeyl-d5e0fhq.png');
    }
};
