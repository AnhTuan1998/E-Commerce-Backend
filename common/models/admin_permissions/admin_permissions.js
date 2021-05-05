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
const dataMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

module.exports = (AdminPermissions) => {
  AdminPermissions.getPermission = async (page = 0, size = 10, orderBy = 'createdAt', orderType = 'desc') => {
    let ctx = loopbackContext.getCurrentContext()
    let userLogin = ctx.get('user')
    await app.models.AdminUsers.isAdministrator(userLogin).catch(err => {
      throw Boom.unauthorized('Permission denied')
    })
    let listData = await AdminPermissions.find({
      limit: size,
      skip: page,
      order: `${orderBy} ${orderType}`
    })

    let meta_data = {
      page, size, "total_records": listData.length
    }

    return [200, listData, meta_data]
  }
  AdminPermissions.remoteMethod(
    'getPermission', {
      http: {verb: 'get', path: '/get-permission'},
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

  AdminPermissions.registerPermission = async (name, slug, httpMethod, httpPath) => {
    Array.isArray(httpMethod) && httpMethod.forEach(item => {
      if (dataMethod.indexOf(item) === -1) throw Boom.badRequest(`Invalid method ${item}`)
    })
    let dataInstance = {name, slug, httpMethod, httpPath, createdAt: constants.TIME_NOW}
    await AdminPermissions.upsert(dataInstance)
    return [200, dataInstance]
  }
  AdminPermissions.remoteMethod(
    'registerPermission', {
      http: {verb: 'post', path: '/register-permission'},
      accepts: [
        {arg: 'name', type: 'string', required: true},
        {arg: 'slug', type: 'string', required: true},
        {arg: 'httpMethod', type: 'any', required: true},
        {arg: 'httpPath', type: 'string', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'data', type: 'object'}
      ]
    }
  )

  AdminPermissions.changePermission = async (id, name, slug, httpMethod, httpPath) => {
    let isExists = await AdminPermissions.findById(id)
    if (!isExists) throw Boom.badRequest('Permission not found')

    await AdminPermissions.findOne({
      where: {name, slug}
    }).then(res => {
      throw Boom.badRequest(`Permission with ${name}, ${slug} already exists`)
    })

    let dataInstance = {name, slug, httpMethod, httpPath, 'updatedAt': constants.TIME_NOW}
    await AdminPermissions.updateAll({id}, dataInstance)
    return [200, 'Update permission successfully']
  }
  AdminPermissions.remoteMethod(
    'changePermission', {
      http: {verb: 'put', path: '/change-permission'},
      accepts: [
        {arg: 'id', type: 'number', required: true},
        {arg: 'name', type: 'string', required: true},
        {arg: 'slug', type: 'string', required: true},
        {arg: 'httpMethod', type: 'any', required: true},
        {arg: 'httpPath', type: 'string', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'message', type: 'string'}
      ]
    }
  )

  AdminPermissions.removePermission = async (id) => {
    let isExists = await AdminPermissions.findById(id)

    if (!isExists) throw Boom.badRequest('Permission not found')

    await AdminMenu.destroyAll({id})
    return [200, 'Remove permission successfully']
  }
  AdminPermissions.remoteMethod(
    'removePermission', {
      http: {verb: 'delete', path: '/remove-permission'},
      accepts: {arg: 'id', type: 'number', required: true},
      returns:
        [{arg: 'status', type: 'number'},
          {arg: 'message', type: 'string'}]
    }
  )
}
