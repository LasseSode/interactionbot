var counter = 0;

module.exports = async (req, res) => {
	let { zoomApp, zoomError, zoomWebhook, request } = res.locals;

	var aurdino = require('../helper/aurdino');

	if (!zoomError) {
		let { type, payload } = zoomWebhook;
		let { toJid, userJid, accountId } = payload;
		counter++
		console.log(counter);
		if (counter > 3) {
			try {
				aurdino.lag();
				counter = 0;
				res.send('success');
			} catch (e) {
				res.send('fail');
			}
		} else {
			res.send('success');
		}
		// 5 seconds
		setTimeout(() => {counter = 0}, 5000)
	} else {
		res.send('fail');
	}
};
