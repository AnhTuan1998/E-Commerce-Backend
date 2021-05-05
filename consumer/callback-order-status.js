require('module-alias/register')
const axios = require('axios')
const Promise = require('bluebird')
let app
const queueName = 'callback_payment_status'
const Boom = require('@hapi/boom')

/*
{
  counter: 0,
  url: 'https://blabla.com',
  params: {
    "apiKey":"ABS123BDA2I",
    "refCode":"25",
    "transactionId":"IDEGI19819",
    "status":"COMPLETED",
    "signature":"3bd69d4c927f9944c5dc6abfa2a65bd37c0ff2b73fc2741e033c5ef6ccf85"
  }
}
*/
let callbackMerchant = async (req) =>{
  let arr = Object.keys(req.params).map(key =>{
    return `${key}=${req.params[key]}`
  })

  let url = `${req.url}?${arr.join('&')}`
  let data = await axios.get(url)
    .then(res =>{
      if(res.status != 200)
        console.log('status', res.status)
      if(res.status == 200)
        return res.data
      return null
    })
    .then(body =>{
      if(body.status != 200){
        console.log('body', JSON.stringify(body, null, 2), url)
        return null
      }
    })
    .catch(ex =>{
      return null
    })
  if(!data){
    Promise.delay(30000)
    .then(()=>{
      return app.rabbitmq
        .then(data => {
          req.counter++
          if(req.counter < 100)
            return data.publish(queueName, req)
          else
            return data.publish(queueName + "_error", req)
        })
    })
  }
}
let startConsumer = async() => {
  app.rabbitmq.then(data => {
      return data.connection
    })
    .then(conn => {
      return conn.createChannel();
    })
    .then(ch => {
      return ch.assertQueue(queueName)
        .then(ok => {
          console.log('consumer is listening on ', queueName)
          return ch.consume(queueName, (msg) => {
            if (msg !== null) {
              console.log(msg.content.toString());
              return callbackMerchant(JSON.parse(msg.content.toString()))
                .then(() => {
                  ch.ack(msg);
                })
            }
          })
        })
    })
    .catch(console.warn);
}

let start = async(param) => {
  await Promise.delay(2000)
  app = param
  startConsumer()
}

module.exports = {
  start: start
}
