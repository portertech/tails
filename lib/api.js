var fs = require('fs')
var haml = require('haml')
var restify = require('restify')
var mime = require('mime')
var models = require('./models')

var db = process.db

if (!db.find('streamName', 'alerts').pop()) {
  new models.stream('alerts')
}

var header = haml(fs.readFileSync(__dirname + '/views/header.haml', 'utf8'))
var application = haml(fs.readFileSync(__dirname + '/views/application.haml', 'utf8'))

var api = restify.createServer()

var loggly = restify.createClient({
  url: 'http://logs.loggly.com'
})

api.get('/', function(req, res) {
  res.send({code: 200, noEnd: true})
  res.end(header({yield: application()}))
})

api.get('/favicon.ico', function(req, res) {
  res.send(200)
})

api.get('/:dir/:file', function(req, res) {
  fs.readFile(__dirname + '/public/' + req.uriParams.dir + '/' + req.uriParams.file, function (err, file) {
    if (err) {
      res.send(404)
    }
    res.send({code: 200, headers: {'Content-Type': mime.lookup(req.uriParams.file)}, noEnd: true})
    res.end(file)
  })
})

api.post('/streams', function(req, res) {
  var name = req.params.name
  if (name) {
    var stream = db.find('streamName', name).pop()
    if (!stream || stream.streamEnabled == false) {
      new models.stream(name)
      res.send(201, name)
    } else {
      res.send(409)
    }
  } else {
    res.send(400) 
  }
})

api.get('/streams', function(req, res) {
  var streams = db.find('streamEnabled', true)
  var result = {}
  for (var i in streams) {
    var stream = streams[i]
    result[stream.streamName] = {
      name: stream.streamName,
      terms: stream.streamTerms,
      forwarding: {
        enabled: stream.streamForwarding,
        token: stream.streamLogglyToken
      }
    }
  }
  res.send(200, result)
})

api.del('/streams/:name', function(req, res) {
  var stream = db.find('streamName', req.uriParams.name).pop()
  if (stream && stream.streamEnabled == true) {
    stream.disable()
    res.send(204)
  } else {
    res.send(404)
  }
})

api.post('/streams/:name/terms', function(req, res) {
  var stream = db.find('streamName', req.uriParams.name).pop()
  var term = req.params.term
  if (stream) {
    if (term) {
      if (stream.streamTerms.indexOf(term) == -1) {
        stream.createTerm(term)
        res.send(201)
      } else {
        res.send(409)
      }
    } else {
      res.send(400)
    }
  } else {
    res.send(404) 
  }
})

api.del('/streams/:name/terms/:term', function(req, res) {
  var stream = db.find('streamName', req.uriParams.name).pop()
  if (stream) {
    stream.removeTerm(req.uriParams.term)
    res.send(204)
  } else {
    res.send(404)
  }
})

api.post('/streams/:name/forwarding', function(req, res) {
  var stream = db.find('streamName', req.uriParams.name).pop()
  var token = req.params.token
  if (stream) {
    if (token) {
      var req = {
        path: '/inputs/' + token,
        body: {
          hello: 'world'
        },
        expect: [200]
      }
      loggly.post(req, function(err, body, headers) {
        if (err) {
          stream.disableForwarding()
          res.send(404)
        } else {
          stream.enableForwarding(token)
          res.send(200)
        }
      })
    } else {
      res.send(400)
    }
  } else {
    res.send(404) 
  }
})

exports.server = api
