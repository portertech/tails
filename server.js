// tails, because syslog rocks.
var fs = require('fs')
var dgram = require('dgram')
var http = require('http')
var io = require('socket.io')
var chain = require('chain-gang')
var models = require('./models')
var db = process.db

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

var loggly = function(msg, token) {
  return function(worker) {
    var opts = {
      host: 'logs.loggly.com',
      path: '/inputs/' + token,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': msg.length
      }
    }
    var req = http.request(opts)
    req.write(JSON.stringify(msg))
    req.end()
    worker.finish()
  }
}

var fwdPatterns = []
process.nextTick(function setPatterns() {
  var patterns = []
  var streams = db.find('streamForwarding', true)
  for (var s in streams) {
    var pattern = ''
    for (var t in streams[s].streamTerms) {
      pattern += '(?=.*' + streams[s].streamTerms[t] + ')'
    }
    pattern += '.*'
    patterns.push({pattern: pattern, token: streams[s].streamLogglyToken})
  }
  fwdPatterns = patterns
  setTimeout(setPatterns, 8000)
})

var websocket = io.listen(8000)

var queue = chain.create({workers: 10})

var syslog = dgram.createSocket('udp4')
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
    websocket.sockets.volatile.emit('msg', msg_info)
    for (var p in fwdPatterns) {
      var regex = new RegExp(fwdPatterns[p].pattern, 'i')
      if (regex.test(msg[4])) {
        queue.add(loggly(msg_info, fwdPatterns[p].token))
        break
      }
    }
  }
})

var syslog_port = parseInt(process.env.TAILS_SYSLOG_PORT) || config.syslog.port
syslog.bind(syslog_port)

var http_port = parseInt(process.env.TAILS_HTTP_PORT) || config.http.port
http.createServer(require('./routes').urls).listen(http_port)
