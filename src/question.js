module.exports = async (req, res) => {
	let { zoomApp, zoomError, zoomWebhook, request } = res.locals;

	var config = require('../config.js');
	var aurdino = require('../helper/aurdino');
  
	if (!zoomError) {
	  let { type, payload } = zoomWebhook;
	  let { toJid, userJid, accountId, cmd } = payload;
	  try {
		aurdino.question();
		var result = await zoomApp.sendMessage({
			to_jid: toJid,
			account_id: accountId,
			visible_to_user: userId,
		  content: {
			body: [{
			  type: 'message',
			  text: `I have a question: `,
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
  