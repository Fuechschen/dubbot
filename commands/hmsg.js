exports.names = ['!hmsg'];
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, bot) {
    var _ = require('underscore');
	var input = data.message.split(' ');
    var arg = _.rest(input, 1).join(' ').trim();
	
	var msg = '';
	switch (arg) {
		case "egema":
			msg += 'Please note: NullcraftNetwork is an german community.';
			msg += 'Some videos on YouTube are blocked because of local copyright restrictions. These videos will be skipped or blacklisteted!';
			break;
		case "eskip":
			msg += 'Sometimes a song skips before it ends. This could have several reasons, e.g. the dj leaves.';
			msg += '\nPlease remember: EVERY TIME A MOD SKIPS A SONG, A PURPLE MESSAGE IS SHOWN IN THE CHAT!';
			break;
		case "estaff":
			msg += 'Staff in this room is only for team members of NCN. Visit our Website to learn more: http://nullcraft.de';
			break;
		case "elottery":
			msg += 'Sometimes, a staff member starts a lottery. Stay active in chat and join the Waitlist to get boosted to Position 1!';
			break;
		case "gskip":
			msg += 'Manchmal endet ein Song bevor er eigentlich zu Ende ist. Dafür gibt es mehrere Gründe, z.B. das der Dj die Community verlässt. IMMER WENN EIN MODERATOR ÜBERSPRINGT GIBT ES EINE VIOLETTE NACHRICHT IM CHAT!';
			break;
		case "gstaff":
			msg += 'Ränge gibt es in dieser Community nur für NCN-Teamler. Schaut euch unsere Website an, um mehr darüber zu erfahren: http://nullcraft.de';
			break;
		case "glottery":
			msg += 'Manchmal startet ein Moderator die Lotterie. Bleib aktiv im Chat und trete der Warteliste bei. Der Gewinner wird auf Position 1 verschoben!';
			break;
		default:
			bot.chat(msg + 'Please specify message!', 30);
			return;
			break;
	}
	bot.chat(msg);
};