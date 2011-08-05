var bdb = require('barricane-db')
var db = new bdb.DB({path: '/tmp/', name: 'tails'})

process.db = db

function Stream(streamName) {
  this.streamName = streamName
  this.streamTerms = []
  this.streamForwarding = false
  this.streamLogglyToken = ''
  this.streamEnabled = true
  db.registerInstance(this)
}

Stream.prototype.createTerm = function(term) {
  this.streamTerms.push(term)
  db.registerInstance(this)
}

Stream.prototype.removeTerm = function(term) {
  for (var i=0; i<this.streamTerms.length; i++) {
    if (this.streamTerms[i] == term) {
      this.streamTerms.splice(i, 1)
      break
    }
  }
  db.registerInstance(this)
}

Stream.prototype.enableForwarding = function(token) {
  this.streamLogglyToken = token
  this.streamForwarding = true
}

Stream.prototype.disableForwarding = function() {
  this.streamForwarding = false
  this.streamLogglyToken = ''
}

Stream.prototype.disable = function() {
  this.streamForwarding = false
  this.streamEnabled = false
}

db.registerConstructors(Stream)

exports.stream = Stream

db.openSync()
