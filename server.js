// tails, because syslog rocks.
var fs = require('fs')
var ws = require('websocket-server')
var dgram = require('dgram')
var sanitizer = require('sanitizer')
var http = require('http-digest')
var loggly = require('loggly')
var models = require('./models')

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

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

websocket = ws.createServer()
websocket.listen(8000)

if (config.loggly.subdomain != "") {
  var beaver = loggly.createClient(config.loggly)
}

db = process.db

var forwarded_streams = []
setInterval(function() {
  forwardedStreams = db.find('streamForwarded', true)
}, 15000)

syslog = dgram.createSocket('udp4')
syslog.on('message', function(msg_orig, rinfo) {
  var msg = (/<([^>]+)>([A-Z][a-z]+\s+\d+\s\d+:\d+:\d+) ([^\s]+) (.*)/).exec(msg_orig)
  if (msg) {
    var facility = Math.floor(msg[1] / 8)
    var msg_info = {
      date: msg[2],
      host: sanitizer.escape(msg[3]),
      severity: severity_lookup[msg[1] - (facility * 8)],
      facility: facility_lookup[facility],
      message: sanitizer.escape(msg[4]),
    }
    websocket.broadcast(JSON.stringify(msg_info))
    for (i in forwardedStreams) {
    }
  }
})

syslog_port = parseInt(process.env.TAILS_SYSLOG_PORT) || config.syslog.port
syslog.bind(syslog_port)

var http_port = parseInt(process.env.TAILS_HTTP_PORT) || config.http.port
http.createServer(config.http.auth.username, config.http.auth.password, require('./routes').urls).listen(http_port)
