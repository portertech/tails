require.paths.unshift('./vendor')
var nstore = require('nstore').extend(require('nstore/query')()).extend(require('nstore/cache')(2100))
var fs = require('fs')
var haml = require('haml')
var clutch = require('clutch')
var querystring = require('querystring')

var streams = nstore.new('./db/streams.db')

var header = haml(fs.readFileSync('views/layouts/header.haml', 'utf8'))
var application = haml(fs.readFileSync('views/layouts/application.haml', 'utf8'))

function tails(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'})
	res.end(header({ yield: application() }))
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
			} else {
				res.writeHead(200, {'Content-Type': 'text/html'})
			}
			res.write(data)
		}
		res.end()
	})
}

function createStream(req, res) {
	req.on('data', function(chunk) {
		var name = querystring.parse(chunk).name
		if (name) {
			var key = name.replace(/[^A-Za-z0-9]/g, "")
			streams.get(key, function (err) {
				if (err) {
					streams.save(key, {name: name, terms: []}, function (err) {
						if (err) {
							console.log(err)
							res.writeHead(500, 'Failed to create stream', {'Content-Type': 'text/plain'})
						} else {
							res.writeHead(201, {'Content-Type': 'text/plain'})
							res.write(key)
						}
						res.end()
					})
				} else {
					res.writeHead(409, 'Stream already exists', {'Content-Type': 'text/plain'})
					res.end()
				}
			})
		} else {
			res.writeHead(400, 'Missing name field', {'Content-Type': 'text/plain'})
			res.end()
		}
	})
}

function getStreams(req, res) {
	streams.all(function (err, results) {
		if (err) {
			console.log(err)
			res.writeHead(500, 'Failed to get streams', {'Content-Type': 'text/plain'})
		} else {
			res.writeHead(200, {'Content-Type': 'application/json'})
			res.write(JSON.stringify(results))
		}
		res.end()
	})
}

function removeStream(req, res, stream) {
	streams.remove(stream, function (err) {
		if (err) {
			console.log(err)
			res.writeHead(500, 'Failed to remove stream', {'Content-Type': 'text/plain'})
		} else {
			res.writeHead(204)
		}
		res.end()
	})
}

function createTerm(req, res, stream) {
	req.on('data', function(chunk) {
		var term = querystring.parse(chunk).term
		if (term) {
			streams.get(stream, function (err, doc) {
				if (err) {
					console.log(err)
					res.writeHead(500, 'Failed to create term', {'Content-Type': 'text/plain'})
					res.end()
				} else {
					var terms = doc.terms
					if (terms.indexOf(term) == -1) {
						terms.push(term)
						streams.save(stream, {name: doc.name, terms: terms}, function (err) {
							if (err) {
								console.log(err)
								res.writeHead(500, 'Failed to create term', {'Content-Type': 'text/plain'})
							} else {
								res.writeHead(201, {'Content-Type': 'text/plain'})
							}
							res.end()
						})
					} else {
						res.writeHead(409, 'Term already exists', {'Content-Type': 'text/plain'})
						res.end()
					}
				}
			})
		} else {
			res.writeHead(400, 'Missing term field', {'Content-Type': 'text/plain'})
			res.end()
		}
	})
}

function removeTerm(req, res, stream, term) {
	streams.get(stream, function (err, doc) {
		if (err) {
			console.log(err)
			res.writeHead(500, 'Failed to remove term', {'Content-Type': 'text/plain'})
			res.end()
		} else {
			var terms = doc.terms
			for (var i=0; i<terms.length; i++) {
				if (terms[i] == term) {
					terms.splice(i, 1)
					break
				}
			}
			streams.save(stream, {name: doc.name, terms: terms}, function (err) {
				if (err) {
					console.log(err)
					res.writeHead(500, 'Failed to remove term', {'Content-Type': 'text/plain'})
				} else {
					res.writeHead(204)
				}
				res.end()
			})
		}
	})
}

exports.urls = clutch.route404([['GET /$', tails],
				['POST /streams$', createStream],
				['POST /streams/(.*)/terms$', createTerm],
				['GET /streams$', getStreams],
				['DELETE /streams/(.*)/terms/(.*)$', removeTerm],
				['DELETE /streams/(.*)$', removeStream],
				['GET /(.*)/(.*)$', serveStatic]])
