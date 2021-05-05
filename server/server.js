'use strict'

require('module-alias/register')
var loopback = require('loopback')
var boot = require('loopback-boot')
var app = module.exports = loopback()

app.middleware('initial', function logResponse(req, res, next) {
	var start = new Date
	if (res._responseTime) {
		return next()
	}
	res._responseTime = true

	res.on('finish', function() {
		var duration = new Date - start
		console.log('<--', req.method, req.path, res.statusCode, duration + 'ms')
	})
	next()
})

app.startAPI = function() {
	return app.listen(function() {
		app.emit('started')
		var baseUrl = app.get('url').replace(/\/$/, '')
		console.log('Web server listening at: %s', baseUrl)
		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath)
		}
	})
}

boot(app, __dirname, function(err) {
	if (err) throw err

	app.utils = require('@common/utils')
	app.rabbitmq = require('@common/models/rabbitmq')()

	const cmd = process.env.CMD || 'API'
	switch (cmd) {
		case 'API': {
			app.startAPI()
			break
		}
		
		case 'callbackOrderStatus': {
			require('@consumer/callback-order-status').start(app)
			break
		}
	}
})
