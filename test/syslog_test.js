var dgram = require('dgram')

var client = dgram.createSocket("udp4")

var message = new Buffer("<71>Nov 23 17:22:23 pirate_ship all the piracy. none of the scurvy! all ye be walkin the plank if me timbers be shiverin. polly does not want a cracker but i will taketh one from ye.")

client.send(message, 0, message.length, 514, "portertech.no.de",
	function (err, bytes) {
		if (err) {
			throw err
		}
	console.log("Wrote " + bytes + " bytes to socket.")
})
