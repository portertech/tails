var dgram = require('dgram')

var options = require("nomnom").opts({
  syslog: {
    default: 5140,
    metavar: "PORT",
    help: 'Default: 5140'
  }
}).parseArgs()

var messages = []
messages.push(new Buffer("<71>Nov 23 17:22:23 pirate_ship-127-0-0-1 all the piracy. none of the scurvy! all ye be walkin the plank if me timbers be shiverin. polly does not want a cracker but i will taketh one from ye."))
messages.push(new Buffer("<56>Nov 23 17:22:24 red_stone-127-0-0-1 tired of constantly buying batteries for automatic doors and deathtraps."))

var syslog = dgram.createSocket("udp4")
var syslogPort = parseInt(process.env.TAILS_SYSLOG_PORT) || options.syslog
setInterval(function() {
  message = messages[Math.floor(Math.random()*messages.length)]
  syslog.send(message, 0, message.length, syslogPort, '127.0.0.1',
    function (err, bytes) {
      if (err) {
        throw err
      }
      console.log('Wrote ' + bytes + ' bytes to socket.')
  })
}, 500)
