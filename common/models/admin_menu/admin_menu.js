/**
 * @Author tuan.vu.
 * @Created on 10/23/20.
 * @Last Modified by: tuan.vu.
 * @Last Modified time: 10/23/20 14:42.
 */
'use strict'

const app = require('@server/server')
let loopbackContext = require('loopback-context')
const Boom = require('@hapi/boom')
const speakeasy = require('speakeasy')
const constants = require('@common/constants');


module.exports = (AdminMenu) => {
  AdminMenu.getMenu = async (page = 0, size = 10, orderBy = 'createdAt', orderType = 'desc') => {
    let ctx = loopbackContext.getCurrentContext()
    let userLogin = ctx.get('user')
    await app.models.AdminUsers.isAdministrator(userLogin).catch(err => {
      throw Boom.unauthorized('Permission denied')
    })
    let listData = await AdminMenu.find({
      limit: size,
      skip: page,
      order: `${orderBy} ${orderType}`
    })

    let meta_data = {
      page, size, "total_records": listData.length
    }

    return [200, listData, meta_data]
  }
  AdminMenu.remoteMethod(
    'getMenu', {
      http: {verb: 'get', path: '/get-menu'},
      accepts: [
        {arg: 'page', type: 'string', required: true},
        {arg: 'size', type: 'string', required: true},
        {arg: 'orderBy', type: 'string', required: true},
        {arg: 'orderType', type: 'string', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'data', type: 'object'},
        {arg: 'meta_data', type: 'object'},
      ]
    }
  )
  AdminMenu.registerMenu = async (title, uri, icon, uid, order) => {
    const isExistsMenu = await AdminMenu.findOne({
      where: {uid}
    })
    if (isExistsMenu) {
      throw Boom.badRequest('Menu already exists')
    }
    const dataInstance = {title, uri, icon, uid, order, createdAt: constants.TIME_NOW}
    await AdminMenu.upsert(dataInstance)
    return [200, dataInstance]
  }
  AdminMenu.remoteMethod(
    'registerMenu', {
      http: {verb: 'post', path: '/register-menu'},
      accepts:
        [{arg: 'title', type: 'string', required: true},
          {arg: 'uri', type: 'string', required: true},
          {arg: 'icon', type: 'string', required: true},
          {arg: 'uid', type: 'string', required: true},
          {arg: 'order', type: 'number', required: true}],
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'data', type: 'object'}]
    }
  )

  AdminMenu.changeMenu = async (title, uri, icon, uid, order) => {
    const menu = await AdminMenu.findOne({
      where: {uid}
    })
    if (!menu) throw Boom.badRequest('Menu not found')
    const dataInstance = {title, uri, icon, order, updatedAt: constants.TIME_NOW}
    await AdminMenu.updateAll({uid}, {dataInstance})
    return [200, 'Change menu successfully']
  }
  AdminMenu.remoteMethod(
    'changeMenu', {
      http: {verb: 'put', path: '/change-menu'},
      accepts:
        [{arg: 'title', type: 'string', required: true},
          {arg: 'uri', type: 'string', required: true},
          {arg: 'icon', type: 'string', required: true},
          {arg: 'uid', type: 'string', required: true},
          {arg: 'order', type: 'number', required: true}],
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'message', type: 'string'}]
    }
  )

  AdminMenu.removeMenu = async (uid) => {
    const menu = await AdminMenu.findOne({
      where: {uid}
    })

    if (!menu) throw Boom.badRequest('Menu not found')
    await AdminMenu.destroyAll({uid})
    return [200, 'Remove menu successfully']
  }
  AdminMenu.remoteMethod(
    'removeMenu', {
      http: {verb: 'delete', path: '/remove-menu'},
      accepts: {arg: 'uid', type: 'string', required: true},
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'message', type: 'string'}]
    }
  )
}
