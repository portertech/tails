var nstore = require('./lib/nstore').extend(require('./lib/nstore/query')())
var fs = require('fs')
var haml = require('./lib/haml')
var clutch = require('./lib/clutch')

var terms = nstore.new('./db/terms.db')

var header = haml(fs.readFileSync('views/layouts/header.haml', 'utf8'))
var application = haml(fs.readFileSync('views/layouts/application.haml', 'utf8'))

function static(req, res, dir, file) {
	fs.readFile('./public/' + dir + '/' + file, function (err, data) {
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/html'})
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

function landing(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'})
	res.end(header({ yield: application() }))
}

function get_terms(req, res) {
	terms.all(function (err, results) {
		if (err) {
			res.writeHead(500, "Failed to get terms.", {'Content-Type': 'text/html'})
		} else {
			res.writeHead(200, "OK", {'Content-Type': 'text/html'})
			console.log(results)
		}
		res.end()
	})
}

function save_term(req, res) {
	req.on('data', function(chunk) {
		var term = require('querystring').parse(chunk).term
		if (term != null) {
			terms.save(null, {'term': term}, function (err) {
				if (err) {
					res.writeHead(500, "Failed to save term.", {'Content-Type': 'text/html'})
				} else {
					res.writeHead(200, "OK", {'Content-Type': 'text/html'})
				}
				res.end()
			})
		} else {
			res.writeHead(500, "Missing term.", {'Content-Type': 'text/html'})
			res.end()
		}
	})
}

exports.urls = clutch.route404([['GET /$', landing],
								['GET /terms$', get_terms],
								['POST /terms$', save_term],
								['GET /(.*)/(.*)$', static]])
