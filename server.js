const http = require('http');
const app = require('./app');
let port = process.env.PORT;
var https = require('https');
var fs = require('fs');
//regular http server
var server = http.createServer(app);
server.listen(port, function() {
  console.log(`${port} is opened`);
});

// // //https server code
// var options = {
//   key: fs.readFileSync('../interactionbot/client-key.pem'),
//   cert: fs.readFileSync('../interactionbot/client-cert.pem')
// };

// var server = https.createServer(options, app);
// server.listen(port, function() {
//   console.log(`${port} is opened`);
// });
