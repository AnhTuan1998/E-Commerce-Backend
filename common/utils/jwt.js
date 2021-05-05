'use strict';

const jwt = require('jsonwebtoken');
const app = require('@server/server');
const constants = require('@common/constants');
const secretKey = app.get('SECRET_KEY_JWT');
const salt = 'ECOMMERCE_WITH_BLOCKCHAIN'

const generateToken = (user, option = {}) => {
  let ttl = option.ttl || (constants.TIME_EXPIRE_USER || 3600); // 1h as default

  let claims = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status
  }

  return jwt.sign({
    data: claims,
  }, secretKey + salt, {
    expiresIn: ttl,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey + salt);
  } catch (e) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
