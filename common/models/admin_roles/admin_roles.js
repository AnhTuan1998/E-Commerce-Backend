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

module.exports = (AdminRoles) => {
  AdminRoles.registerRole = async (name, slug, listMenu, listPermission) => {
    let isExists = await AdminRoles.findOne({
      where: {name, slug}
    })
    if (isExists) throw Boom.badRequest('Role already exists')
    let dataInstance = {name, slug, createdAt: constants.TIME_NOW}
    try {
      await app.dataSources.mysqlDS.transaction(async (models) => {
        let dataRole = await models.AdminRoles.upsert(dataInstance)
        if (Array.isArray(listMenu)) {
          for (let item of listMenu) {
            let isMenu = await models.AdminMenu.findById(item)
            if (!isMenu) throw Boom.badRequest(`Menu with id ${item} not found`)
            let isExists = await models.AdminRoleMenu.findOne({
              where: {
                roleId: dataRole.id,
                menuId: item
              }
            })
            if (isExists) throw Boom.badRequest('Menu role already exists')
            await models.AdminRoleMenu.upsert({roleId: dataRole.id, menuId: item, createdAt: constants.TIME_NOW})
          }
        } else {
          throw Boom.badRequest('List menu must be array')
        }
        if (Array.isArray(listPermission)) {
          for (let item of listPermission) {
            let isPermission = await models.AdminPermissions.findById(item)
            if (!isPermission) throw Boom.badRequest(`Permission with id ${item} not found`)
            let isExists = await models.AdminRolePermissions.findOne({
              where: {roleId: dataRole.id, permissionId: item}
            })
            if (isExists) throw Boom.badRequest('Role permission already exists')
            await models.AdminRolePermissions.upsert({roleId: dataRole.id, permissionId: item, createdAt: constants.TIME_NOW})
          }
        } else {
          throw Boom.badRequest('List permission must be array')
        }
      })
    } catch (e) {
      throw Boom.badRequest(e.isBoom ? e.output.payload.message : 'Something went wrong')
    }
    return [200, dataInstance]
  }
  AdminRoles.remoteMethod(
    'registerRole', {
      http: {verb: 'post', path: '/register-role'},
      accepts: [
        {arg: 'name', type: 'string', required: true},
        {arg: 'slug', type: 'string', required: true},
        {arg: 'listMenu', type: 'any', required: true},
        {arg: 'listPermission', type: 'any', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'data', type: 'object'}
      ]
    }
  )
  AdminRoles.changeRole = async (id, name, slug, listMenu, listPermission) => {
    let isExists = await AdminRoles.findById(id, {
      include: ['AdminMenu', 'AdminPermissions']
    })

    if (!isExists) throw Boom.badRequest('Role not found')
    console.log(isExists, 'isExists')

    return [200, {}]
  }
  AdminRoles.remoteMethod(
    'changeRole', {
      http: {verb: 'put', path: '/change-role'},
      accepts: [
        {arg: 'id', type: 'number', required: true},
        {arg: 'name', type: 'string', required: true},
        {arg: 'slug', type: 'string', required: true},
        {arg: 'listMenu', type: 'any', required: true},
        {arg: 'listPermission', type: 'any', required: true}
      ],
      returns: [
        {arg: 'status', type: 'number'},
        {arg: 'data', type: 'object'}
      ]
    }
  )
}
