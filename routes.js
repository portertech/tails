var clutch = require('./lib/clutch')
var fs = require('fs')
var haml = require('./lib/haml')
var nstore = require('./lib/nstore')

var terms = nstore.new('./db/terms.db')

var header = haml(fs.readFileSync('views/layouts/header.haml', 'utf8'))
var websocket_js = fs.readFileSync('public/scripts/websocket.js', 'utf8')
var style = fs.readFileSync('public/stylesheets/style.css', 'utf8')
var application = haml(fs.readFileSync('views/layouts/application.haml', 'utf8'))

function css(req, res) {
	res.writeHead(200, {'Content-Type': 'text/css'})
	res.end(style)
}

function js(req, res) {
	res.writeHead(200, {'Content-Type': 'text/javascript'})
	res.end(websocket_js)
}

function landing(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'})
	res.end(header({ yield: application() }))
}

function get_terms(req, res) {
	terms.all(function (err, results) {
		if (err) {
			res.writeHead(200, "OK", {'Content-Type': 'text/html'})
			res.end(results)
		} else {
			res.writeHead(500, "Failed to get terms.", {'Content-Type': 'text/html'})
			res.end()
		}
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

exports.urls = clutch.route404([['GET /style.css$', css],
								['GET /javascript.js$', js],
								['GET /$', landing],
								['GET /terms$', get_terms],
								['POST /terms$', save_term]])
