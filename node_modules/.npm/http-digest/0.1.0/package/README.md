# node-http-digest

Node-http-digest is a module that enables Node.js web servers to perform HTTP Digest authentication as per RFC 2617. It can be used as a standalone server, but also exports a function that enables you to do on-demand authentication. This is useful if you want to combine it with e.g. a routing framework.

## Installation

Installation is easy if you have [NPM](http://github.com/isaacs/npm):

	$ npm install http-digest

After installation you can do `var httpdigest = require('http-digest');` to use it.

## Usage

You can use the `createServer` command to set up an HTTP server, just like you would do with the Node.js standard library server. The http-digest method however requires two additional arguments: a username and a password. The request handler callback function will only be called on successfully authenticated requests.

	var httpdigest = require('http-digest');

	/* A simple secured web server, unauthenticated requests are not allowed */
	httpdigest.createServer("theuser", "thepass", function(request, response) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.end("<h1>Secure zone!</h1>");
	}).listen(8000);

Alternatively, you can use the `http_digest_auth(request, response, username, password, callback)` function. This function checks authentication of the given request and executes the callback if authentication is successful. Otherwise a 401 Unauthorized page is presented to the client. This function is useful to limit only parts of your server to authenticated clients.

## Future work

In the future I would like to add support for multiple users and some other improvements. See the `TODO` file for more details. Pull requests are very welcome. ;-)

## Credits

Copyright (C) 2010 [Emil Loer](http://twitter.com/thedjinn).

Node-http-digest is licensed under the MIT license.
