let axios = require('axios')
let app = require('@server/server')
module.exports = function(options) {
	return function logError(err, req, res, next) {
		let result = {
			status: 500,
			message: "System maintenance"
		}

		if (err.isBoom) {
			console.error(err.output.statusCode, err.output.payload.message, err.output.payload.data)
			result = {
				status: err.output.statusCode,
				message: err.output.payload.message
			}
		} else {
			let status = err.status || (err.statusCode || 500)
			if (status < 500) {
				result = {
					status: status,
					message: err.message
				}
			} else {
				console.error(err)
				result = {
					status: status,
					message: "System maintenance"
				}
			}
		}

		//handle exception here

		res.status(result.status).json(result)
		next()
	};
};
