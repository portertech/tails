var dgram = require('dgram')

var syslog = dgram.createSocket("udp4")

var message = new Buffer("<71>Nov 23 17:22:23 pirate_ship-127-0-0-1 all the piracy. none of the scurvy! all ye be walkin the plank if me timbers be shiverin. polly does not want a cracker but i will taketh one from ye.")

syslog_port = parseInt(process.env.TAILS_SYSLOG_PORT) || 514
setInterval(function() {
  syslog.send(message, 0, message.length, syslog_port, '127.0.0.1',
    function (err, bytes) {
      if (err) {
        throw err
      }
      console.log('Wrote ' + bytes + ' bytes to socket.')
  })
}, 10)
