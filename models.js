var bdb = require('barricane-db')
var db = new bdb.DB({path: './db/', name: 'streams'})

process.db = db

function Stream(streamName) {
  this.streamName = streamName
  this.streamTerms = []
  this.streamForwarded = false
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

Stream.prototype.forward = function() {
  this.streamForwarded = !this.streamForwarded
}

Stream.prototype.disable = function() {
  this.streamForwarded = false
  this.streamEnabled = false
}

db.registerConstructors(Stream)

exports.Stream = Stream

db.openSync()
