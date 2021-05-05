/**
 * @Author tuan.vu.
 * @Created on 10/23/20.
 * @Last Modified by: tuan.vu.
 * @Last Modified time: 10/23/20 11:49.
 */

'use strict'

const app = require('@server/server')
let loopbackContext = require('loopback-context')
const Boom = require('@hapi/boom')
const speakeasy = require('speakeasy')
const constants = require('@common/constants');

module.exports = (AdminUsers) => {
  AdminUsers.registerAccount = async (username, password, email, name, avatar, rememberToken, status, listRole) => {
    let isExists = await AdminUsers.findOne({
      where: {email, username}
    })
    if (isExists) throw Boom.badRequest('Email or username already exists')
    let dataInstance = {
      username,
      password: app.utils.crypto.bcriptEncrypt(password),
      email,
      name,
      avatar,
      rememberToken,
      status,
      createdAt: constants.TIME_NOW
    }
    try {
      await app.dataSources.mysqlDS.transaction(async (models) => {
        let dataUser = await models.AdminUsers.upsert(dataInstance)
        if (Array.isArray(listRole)) {
          for (let item of listRole) {
            let isRole = await models.AdminRoles.findById(item)
            if (!isRole) throw Boom.badRequest(`Role with id ${item} not found`)
            let isExists = await models.AdminRoleUsers.findOne({
              where: {
                roleId: item,
                userId: dataUser.id
              }
            })
            if (isExists) throw Boom.badRequest('User role already exists')
            await models.AdminRoleUsers.upsert({roleId: item, userId: dataUser.id, createdAt: constants.TIME_NOW})
          }
        } else {
          throw Boom.badRequest('List role must be array')
        }
      })
    } catch (e) {
      throw Boom.badRequest(e.isBoom ? e.output.payload.message : 'Something went wrong')
    }
    return [200, dataInstance]
  }
  AdminUsers.remoteMethod(
    'registerAccount', {
      http: {verb: 'post', path: '/register-account'},
      accepts: [
        {arg: 'username', type: 'string', required: true},
        {arg: 'password', type: 'string', required: true},
        {arg: 'email', type: 'string', required: true},
        {arg: 'name', type: 'string', required: true},
        {arg: 'avatar', type: 'string', required: false},
        {arg: 'rememberToken', type: 'string', required: false},
        {arg: 'status', type: 'number', required: true},
        {arg: 'listRole', type: 'any', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'data', type: 'object'}
      ]
    }
  )

  AdminUsers.login = async (username, password) => {
    let account = await AdminUsers.findOne({
      where: {username},
      fields: ['username', 'password', 'name', 'avatar', 'rememberToken', 'email', 'status']
    })

    if (!account) throw Boom.badRequest('Account with username not found')

    if (!app.utils.crypto.bscryptCompare(account.password, password)) throw Boom.unauthorized('Password invalid')

    let roleUser = await app.models.AdminRoleUsers.find({
      where: {
        userId: account['id']
      },
      fields: ['roleId']
    })

    let arrRole = []
    for (let item of roleUser) {
      let role = await app.models.AdminRoles.findOne({
        where: {
          id: item['roleId']
        },
        fields: ['name', 'slug']
      })
      arrRole.push(role)
    }
    account['role'] = arrRole
    account['access_token'] = await app.utils.jwt.generateToken(account)
    return [200, account]
  }
  AdminUsers.remoteMethod(
    'login', {
      http: {verb: 'post', path: '/sign-in'},
      accepts: [
        {arg: 'username', type: 'string', required: true},
        {arg: 'password', type: 'string', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'data', type: 'object'}
      ]
    }
  )
  AdminUsers.isAdministrator = (user) => {
    return new Promise((resolve, reject) => {
      let listRole = user['role'].map(item => {
        return item['slug']
      }).indexOf(constants.ADMINISTRATOR)
      if (listRole !== -1 ) {
        return resolve()
      }
      return reject()
    })
  }
}
