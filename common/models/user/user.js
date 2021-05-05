'use strict'

const app = require('@server/server')
let loopbackContext = require('loopback-context')
const Boom = require('@hapi/boom')
const speakeasy = require('speakeasy')

module.exports = (User) => {
  User.login = async function (email, password) {
    let user = await User.findOne({
      where: {
        email: email
      }
    })
    if (user) {
      if (app.utils.crypto.bscryptCompare(user.password, password)) {
        return [200, 'success', {
          id: user.id,
          email: user.email,
          name: user.name,
        }]
      }
    }
    throw Boom.unauthorized('Login failed')
  }
  User.remoteMethod(
    'login', {
      http: {verb: 'post', path: '/login'},
      accepts:
        [{arg: 'email', type: 'string', required: true},
          {arg: 'password', type: 'string', required: true}],
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'message', type: 'string'},
          {arg: 'data', type: 'object'}]
    }
  )

  User.changePassword = async function (oldPassword, newPassword) {
    let ctx = loopbackContext.getCurrentContext()
    let user = await User.findOne({
      where: {
        email: ctx.get('user').email
      }
    })
    if (app.utils.validator.checkValidatePassword(newPassword).length > 0) throw Boom.badRequest('Passwords must only letters, numbers and underscores, contain at least 8 characters, least one number (0-9),least one lowercase letter (a-z),least one uppercase letter (A-Z)')
    if (user) {
      if (app.utils.crypto.bscryptCompare(user.password, oldPassword)) {
        let password = app.utils.crypto.bcriptEncrypt(newPassword)
        user = await User.updateAll({
          id: user.id
        }, {
          password: password
        })
        return [200, 'Change password success', user]
      } else {
        throw Boom.badRequest('Old password doesn\'t match!')
      }
    }
    throw Boom.badRequest('User not found')
  }
  User.remoteMethod(
    'changePassword', {
      http: {verb: 'put', path: '/change-password'},
      accepts: [{arg: 'oldPassword', type: 'string', required: true},
        {arg: 'newPassword', type: 'string', required: true}],
      returns: [{arg: 'status', type: 'number'},
        {arg: 'message', type: 'string'},
        {arg: 'data', type: 'object'}]
    }
  )

  User.signUpUser = async function (firstName, lastName, email, password, emailCode, countryCode) {
    const checkExistUser = await User.findOne({
      where: {
        email: email.trim()
      }
    })
    if (checkExistUser)
      throw Boom.badRequest('Email already registered, please choose an other email')

    if (password.length < 8) throw Boom.badRequest('Password must be at least 8 letters')

    //check countryCode here

    let userAddInstance = {
      firstName,
      lastName,
      email,
      countryCode,
      password: app.utils.crypto.bcriptEncrypt(password),
      createdAt: Math.floor(Date.now() / 1000)
    }
    await User.upsert(userAddInstance)
    delete userAddInstance.password
    return [200, userAddInstance]
  }
  User.remoteMethod(
    'signUpUser', {
      http: {verb: 'post', path: '/signup'},
      accepts:
        [{arg: 'firstName', type: 'string', required: true},
          {arg: 'lastName', type: 'string', required: true},
          {arg: 'email', type: 'string', required: true},
          {arg: 'password', type: 'string', required: true},
          {arg: 'emailCode', type: 'string', required: true, description: 'include 6 number'},
          {arg: 'countryCode', type: 'string', required: true, description: 'ex: VN'}],
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'data', type: 'object'}]
    }
  )

  User.forgotPassword = async (email, emailCode, newPassword) => {
    let checkExistUser = await User.findOne({
      where: {
        email: email.trim()
      }
    })
    if (!checkExistUser) throw Boom.badRequest('User not exist')

    //check email code here

    if (app.utils.validator.checkValidatePassword(newPassword).length > 0) throw Boom.badRequest('Passwords must only letters, numbers and underscores, contain at least 8 characters, least one number (0-9),least one lowercase letter (a-z),least one uppercase letter (A-Z)')

    let password = app.utils.crypto.bcriptEncrypt(newPassword)

    let user = await User.updateAll({
      id: checkExistUser.id
    }, {
      password: password
    })

    return [200, 'Reset password success', user]
  }
  User.remoteMethod(
    'forgotPassword', {
      http: {verb: 'post', path: '/forgot-password'},
      accepts:
        [{arg: 'email', type: 'string', required: true},
          {arg: 'emailCode', type: 'string', required: true, description: 'include 6 number'},
          {arg: 'password', type: 'string', required: true},],
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'message', type: 'string'},
          {arg: 'data', type: 'object'}]
    }
  )
}
