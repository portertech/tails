var dgram = require('dgram')

var syslog_regex = /<([0-9]{1,3})>([A-z]{3} [0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}) (\S+) (.*)/

syslog = dgram.createSocket('udp4')
syslog.on('message', function(msg_orig, rinfo) {
	var msg = syslog_regex.exec(msg_orig)
	if (msg != null) {
		var facility = Math.floor(msg[1] / 8)
		var msg_info = {
			date: msg[2],
			host: msg[3],
			level: msg[1] - (facility * 8),
			facility: facility,
			message: msg[4],
		}
		console.log(msg_info)
	}
})

syslog.bind(514)
