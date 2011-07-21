var fs = require('fs')
var haml = require('haml')
var clutch = require('clutch')
var querystring = require('querystring')
var models = require('./models')

db = process.db

if (!db.find('streamName', 'alerts')[0]) {
  new models.Stream('alerts')
}

var header = haml(fs.readFileSync('views/layouts/header.haml', 'utf8'))
var application = haml(fs.readFileSync('views/layouts/application.haml', 'utf8'))

function tails(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(header({ yield: application() }))
}

function favicon(req, res) {
  res.writeHead(200, {'Content-Type': 'image/gif'})
  res.end()
}

function getStatic(req, res, dir, file) {
  fs.readFile('./public/' + dir + '/' + file, function (err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'})
    } else {
      switch (dir) {
        case 'scripts':
          res.writeHead(200, {'Content-Type': 'text/javascript'})
          break
        case 'stylesheets':
          res.writeHead(200, {'Content-Type': 'text/css'})
          break
        case 'images':
          res.writeHead(200, {'Content-Type': 'image/png'})
          break
        default:
          res.writeHead(200, {'Content-Type': 'text/html'})
      }
      res.write(data)
    }
    res.end()
  })
}

function createStream(req, res) {
  var requestString = ''
  req.on('data', function(chunk) {
    requestString += chunk
  })
  req.on('end' , function() {
    var name = querystring.parse(requestString).name    
    if (name) {
      var stream = db.find('streamName', name).pop()
      if (!stream || stream.streamEnabled == false) { 
        new models.Stream(name)
        res.writeHead(201, {'Content-Type': 'text/plain'})
        res.write(name)
      } else {
        res.writeHead(409, 'Stream already exists', {'Content-Type': 'text/plain'})
      }
    } else {
      res.writeHead(400, 'Missing field - name', {'Content-Type': 'text/plain'})
    }
    res.end()
  })
}

function getStreams(req, res) {
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
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.end(JSON.stringify(result))
}

function removeStream(req, res, name) {
  var stream = db.find('streamName', name).pop()
  if (stream && stream.streamEnabled == true) {
    stream.disable()
    res.writeHead(204)
  } else {
    res.writeHead(404, 'Stream does not exist', {'Content-Type': 'text/plain'})
  }
  res.end()
}

function createTerm(req, res, name) {
  var requestString = ''
  req.on('data', function(chunk) {
    requestString += chunk
  })
  req.on('end', function() {
    var term = querystring.parse(requestString).term
    if (term) {
      var stream = db.find('streamName', name).pop()
      if (stream) {
        if (stream.streamTerms.indexOf(term) == -1) {
          stream.createTerm(term)
          res.writeHead(201, {'Content-Type': 'text/plain'})
	} else {
          res.writeHead(409, 'Term already exists', {'Content-Type': 'text/plain'})
	}
      } else {
        res.writeHead(404, 'Stream does not exist', {'Content-Type': 'text/plain'})
      }
    } else {
      res.writeHead(400, 'Missing field - term', {'Content-Type': 'text/plain'})
    }
    res.end()     
  })
}

function removeTerm(req, res, name, term) {
  var stream = db.find('streamName', name).pop()
  if (stream) {
    stream.removeTerm(term)
    res.writeHead(204)
  } else {
    res.writeHead(404, 'Stream does not exist', {'Content-Type': 'text/plain'})
  }
  res.end()
}

function toggleForwarding(req, res, name) {
  var requestString = ''
  req.on('data', function(chunk) {
    requestString += chunk
  })
  req.on('end', function() {
    var token = querystring.parse(requestString).token
    var stream = db.find('streamName', name).pop()
    if (stream) {
      if (token) {
        stream.toggleForwarding(token)
        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.write(stream.streamForwarding.toString())
      } else {
        res.writeHead(400, 'Missing field - token', {'Content-Type': 'text/plain'})
      }
    } else {
      res.writeHead(404, 'Stream does not exist', {'Content-Type': 'text/plain'})
    }
    res.end()
  })
}

exports.urls = clutch.route404([['GET /$', tails],
				['GET /favicon.ico', favicon],
				['POST /streams$', createStream],
				['POST /streams/(.*)/terms$', createTerm],
				['POST /streams/(.*)/forwarding$', toggleForwarding],
				['GET /streams$', getStreams],
				['DELETE /streams/(.*)/terms/(.*)$', removeTerm],
				['DELETE /streams/(.*)$', removeStream],
				['GET /(.*)/(.*)$', getStatic]])
