module.exports = async (req, res) => {
	let { zoomApp, zoomError, zoomWebhook, request } = res.locals;

	var aurdino = require('../helper/aurdino');

	if (!zoomError) {
		let { type, payload } = zoomWebhook;
		let { toJid, userJid, accountId } = payload;
		try {
			aurdino.like();
			res.send('success');
		} catch (e) {
			res.send('fail');
		}
	} else {
		res.send('fail');
	}
};
