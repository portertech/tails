#!/usr/bin/env node

var httpdigest = require('./lib/http-digest');

/* A simple secured web server, unauthenticated requests are not allowed */
httpdigest.createServer("theuser", "thepass", function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end("<h1>Secure zone!</h1>");
}).listen(8000);
