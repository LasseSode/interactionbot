module.exports = async (req, res) => {
	let { zoomApp, zoomError, zoomWebhook, request } = res.locals;

	var config = require('../config.js');
	var aurdino = require('../helper/aurdino');
	var mqtthandler = require('../helper/mqtt_handler');


	if (!zoomError) {
		let { type, payload } = zoomWebhook;
		let { toJid, userJid, accountId, cmd } = payload;
		try {
			aurdino.question();
			mqtthandler.publishArmUp();
			mqtthandler.publishHappy();
			var result = await zoomApp.sendMessage({
				to_jid: config.owner,
				account_id: zoomWebhook.payload.accountId,
				//visible_to_user: config.owner,
				content: {
					head: {
						text: "Question asked"
					},
					body: [{
						type: 'message',
						text: payload.cmd.split("question")[1].substring(1),
						style: {
							bold: true
						}
					}]
				}
			});
			console.log(JSON.stringify(result))
			res.send('success');
		} catch (e) {
			res.send('fail');
		}
	} else {
		res.send('fail');
	}
};
