function Stream(streamName) {
  this.streamName = streamName
  this.streamTerms = []
  this.streamEnabled = true
  process.db.registerInstance(this)
}

Stream.prototype.disable = function() {
  this.streamEnabled = false
}

Stream.prototype.createTerm = function(term) {
  this.streamTerms.push(term)
  process.db.registerInstance(this)
}

Stream.prototype.removeTerm = function(term) {
  for (var i=0; i<this.streamTerms.length; i++) {
    if (this.streamTerms[i] == term) {
      this.streamTerms.splice(i, 1)
      break
    }
  }
  process.db.registerInstance(this)
}

process.db.registerConstructors(Stream)

exports.Stream = Stream
