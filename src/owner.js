module.exports = async (req, res) => {
	let { zoomApp, zoomError, zoomWebhook, request } = res.locals;

	var config = require('../config.js');

	if (!zoomError) {
		let { type, payload } = zoomWebhook;
		let { toJid, userJid, accountId } = payload;
		try {
			config.owner = userJid;
			console.log("set owner as " + config.owner);
			res.send('success');
		} catch (e) {
			res.send('fail');
		}
	} else {
		res.send('fail');
	}
};
