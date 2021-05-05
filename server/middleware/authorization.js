/**
 * @Author tavu.
 * @Created on 3/6/21.
 * @Last Modified by: tavu.
 * @Last Modified time: .
 */
'use strict'

let app = require('@server/server')
let loopbackContext = require('loopback-context')
const Boom = require('@hapi/boom')

module.exports = function() {
  return async(req, res, next) => {
    let ctx = loopbackContext.getCurrentContext()
    let err = new Error()

    let token = req.headers['authorization']
    if (!token) {
      return next(Boom.unauthorized('Missing authorization token'))
    }

    token = token.replace('Bearer ', '')
    const data = app.utils.jwt.verifyToken(token)
    if (!data) {
      return next(Boom.unauthorized('Invalid token or expired'))
    }
    ctx.set('user', {
      id: data.data.id,
      email: data.data.email,
      role: data.data.role,
      status: data.data.status || 1
    })
    return next()
  }
}
