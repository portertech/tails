#!/usr/bin/env node

var fs = require('fs')
var syslog = require('../lib/syslog')
var api = require('../lib/api')

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

var syslog_port = parseInt(process.env.TAILS_SYSLOG_PORT) || config.syslog.port
syslog.server.bind(syslog_port)

var http_port = parseInt(process.env.TAILS_HTTP_PORT) || config.http.port
api.server.listen(http_port)
