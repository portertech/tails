var dgram = require('dgram')

var client = dgram.createSocket("udp4")

var message = new Buffer("<71>Nov 23 17:22:23 pirate_ship all the piracy. none of the scurvy!")

client.send(message, 0, message.length, 5140, "127.0.0.1",
	function (err, bytes) {
		if (err) {
			throw err
		}
	console.log("Wrote " + bytes + " bytes to socket.")
})