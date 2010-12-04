// tails, because syslog rocks.
require.paths.unshift('./vendor')
var ws = require('websocket-server')
var dgram = require('dgram')
var http = require('http')

websocket = ws.createServer()
websocket.listen(8000)

var severity_lookup = {
	0: 'emerg',
	1: 'alert',
	2: 'crit',
	3: 'err',
	4: 'warn',
	5: 'notice',
	6: 'info',
	7: 'debug',
}

var facility_lookup = {
	0: 'kern',
	1: 'user',
	2: 'mail',
	3: 'daemon',
	4: 'auth',
	5: 'syslog',
	6: 'lpr',
	7: 'news',
	8: 'uucp',
	9: 'cron',
	10: 'authpriv',
	11: 'ftp',
	12: 'ntp',
	13: 'audit',
	14: 'alert',
	15: 'at',
	16: 'local0',
	17: 'local1',
	18: 'local2',
	19: 'local3',
	20: 'local4',
	21: 'local5',
	22: 'local6',
	23: 'local7',
}

syslog = dgram.createSocket('udp4')
syslog.on('message', function(msg_orig, rinfo) {
	var msg = (/<([^>]+)>([A-Z][a-z]+\s+\d+\s\d+:\d+:\d+) ([^\s]+) (.*)/).exec(msg_orig)
	if (msg) {
		var facility = Math.floor(msg[1] / 8)
		var msg_info = {
			date: msg[2],
			host: msg[3],
			severity: severity_lookup[msg[1] - (facility * 8)],
			facility: facility_lookup[facility],
			message: msg[4],
		}
		websocket.broadcast(JSON.stringify(msg_info))
	}
})

syslog_port = parseInt(process.ENV.TAILS_SYSLOG_PORT) || 514
syslog.bind(syslog_port)

var http_port = parseInt(process.ENV.TAILS_HTTP_PORT) || 80
http.createServer(require('./routes').urls).listen(http_port)
