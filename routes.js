var fs = require('fs')
var haml = require('haml')
var clutch = require('clutch')
var querystring = require('querystring')
var bdb = require('barricane-db')
var db = new bdb.DB({path: './db/', name: 'streams'})

process.db = db
var model = require('./models.js')
db.openSync()

if (!db.find('streamName', 'alerts')[0]) {
  new model.Stream('alerts', [])
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

function serveStatic(req, res, dir, file) {
  fs.readFile('./public/' + dir + '/' + file, function (err, data) {
    if (err) {
      console.log(err)
      res.writeHead(404, {'Content-Type': 'text/plain'})
    } else {
      if (dir == 'scripts') {
        res.writeHead(200, {'Content-Type': 'text/javascript'})
      } else if (dir == 'stylesheets') {
        res.writeHead(200, {'Content-Type': 'text/css'})
      } else if (dir == 'images') {
        res.writeHead(200, {'Content-Type': 'image/png'})
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'})
      }
      res.write(data)
    }
    res.end()
  })
}

function createStream(req, res) {
  var requestString = ""
  req.on('data', function(chunk) {
    requestString += chunk
  })
  req.on('end' , function() {
    var name = querystring.parse(requestString).name    
    if (name) {
      var stream = db.find('streamName', name).pop()
      if (!stream || stream.streamEnabled == false) { 
        new model.Stream(name, [])
        res.writeHead(201, {'Content-Type': 'text/plain'})
        res.write(name)
      } else {
        res.writeHead(409, 'Stream already exists', {'Content-Type': 'text/plain'})
      }
    } else {
      res.writeHead(400, 'Missing name field', {'Content-Type': 'text/plain'})
    }
    res.end()
  })
}

function getStreams(req, res) {
  var streams = db.find('streamEnabled', true)
  var result = {}
  for (i in streams) {
    var stream = streams[i]
    result[stream.streamName] = {name: stream.streamName, terms: stream.streamTerms}
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
  var requestString = ""
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
      res.writeHead(400, 'Missing term field', {'Content-Type': 'text/plain'})
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

exports.urls = clutch.route404([['GET /$', tails],
				['GET /favicon.ico', favicon],
				['POST /streams$', createStream],
				['POST /streams/(.*)/terms$', createTerm],
				['GET /streams$', getStreams],
				['DELETE /streams/(.*)/terms/(.*)$', removeTerm],
				['DELETE /streams/(.*)$', removeStream],
				['GET /(.*)/(.*)$', serveStatic]])
