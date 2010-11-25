var dgram = require('dgram')

var ws = require('./lib/ws/server')

websocket = ws.createServer()
websocket.listen(8000)

var syslog_regex = /<([0-9]{1,3})>([A-z]{3} [0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}) (\S+) (.*)/

syslog = dgram.createSocket('udp4')
syslog.on('message', function(msg_orig, rinfo) {
	var msg = syslog_regex.exec(msg_orig)
	if (msg != null) {
		var facility = Math.floor(msg[1] / 8)
		var msg_info = {
			date: msg[2],
			host: msg[3],
			severity: msg[1] - (facility * 8),
			facility: facility,
			message: msg[4],
		}
		console.log(msg_info)
		websocket.broadcast(JSON.stringify(msg_info))
	}
})

syslog.bind(5140)

var http = require('http')
var haml = require('./lib/haml')
var fs = require('fs')

var header = haml(fs.readFileSync('views/layouts/header.haml', 'utf8'))
var websocket_js = fs.readFileSync('public/scripts/websocket.js', 'utf8')

var application = haml(fs.readFileSync('views/layouts/application.haml', 'utf8'))

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'})
	res.write(header({ websocket_js: websocket_js }))
	res.end(application())
}).listen(8080)
