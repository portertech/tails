var clutch = require('./lib/clutch')
var fs = require('fs')
var haml = require('./lib/haml')

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
	res.write(header({ websocket_js: websocket_js }))
	res.end(application())
}

exports.urls = clutch.route404([['GET /style.css$', css],
								['GET /javascript.js$', js],
								['GET /$', landing]])
