var dgram = require('dgram')
var http = require('http')
var io = require('socket.io')
var chain = require('chain-gang')
var models = require('./models')

var db = process.db

var severityLookup = [
  'emerg',
  'alert',
  'crit',
  'err',
  'warn',
  'notice',
  'info',
  'debug'
]

var facilityLookup = [
  'kern',
  'user',
  'mail',
  'daemon',
  'auth',
  'syslog',
  'lpr',
  'news',
  'uucp',
  'cron',
  'authpriv',
  'ftp',
  'ntp',
  'audit',
  'alert',
  'at',
  'local0',
  'local1',
  'local2',
  'local3',
  'local4',
  'local5',
  'local6',
  'local7'
]

var loggly = function(msg, token) {
  return function(worker) {
    data = JSON.stringify(msg)
    var opts = {
      host: 'logs.loggly.com',
      path: '/inputs/' + token,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }
    var req = http.request(opts)
    req.write(data)
    req.end()
    worker.finish()
  }
}

var logglyPatterns = []
process.nextTick(function setPatterns() {
  var patterns = []
  var streams = db.find('streamForwarding', true)
  for (var s in streams) {
    if (streams[s].streamTerms.length > 0) {
      var pattern = '^'
      var negative = []
      for (var t in streams[s].streamTerms) {
        var term = streams[s].streamTerms[t]
        if (term.substr(0,1) == '!') {
          negative.push(term.slice(1))
        } else {
          pattern += '(?=.*' + term + ')'
        }
      }
      if (negative.length > 0) {
        pattern += '((?!' + negative.join('|') + ').)*$'
      } else {
        pattern += '.*'
      }
      patterns.push({regex: new RegExp(pattern, 'i'), token: streams[s].streamLogglyToken})
    }
  }
  logglyPatterns = patterns
  setTimeout(setPatterns, 8000)
})

var websocket = io.listen(8000)

var queue = chain.create({workers: 12})

var syslog = dgram.createSocket('udp4')
syslog.on('message', function(msg_orig, rinfo) {
  var msg = (/<([^>]+)>([A-Z][a-z]+\s+\d+\s\d+:\d+:\d+) ([^\s]+) (.*)/).exec(msg_orig)
  if (msg) {
    var facility = Math.floor(msg[1] / 8)
    var msg_json = {
      date: msg[2],
      host: msg[3],
      severity: severityLookup[msg[1] - (facility * 8)],
      facility: facilityLookup[facility],
      message: msg[4]
    }
    websocket.sockets.volatile.emit('msg', msg_json)
    for (var p in logglyPatterns) {
      if (logglyPatterns[p].regex.test(msg[4])) {
        queue.add(loggly(msg_json, logglyPatterns[p].token))
        break
      }
    }
  }
})

exports.server = syslog
