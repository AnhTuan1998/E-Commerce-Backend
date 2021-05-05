const app = require('@server/server');

let channel
const rabbitmqURL = app.get('RABBITMQ_URL')

let publish = async function(queueName, message) {
	if (typeof(message) == 'object')
		message = JSON.stringify(message)
	return channel.then(function(ch) {
		return ch.assertQueue(queueName).then(function(ok) {
			return ch.sendToQueue(queueName, new Buffer(message))
		})
	})
}

module.exports = () => {
	return require('amqplib')
		.connect(rabbitmqURL)
		.then(conn =>{
			channel = conn.createChannel();
			return conn
		})
		.then(conn =>{
			return {
				publish: publish,
				connection: conn
			}
		})
}
