'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');

let bcriptEncrypt = (password) => {
	let hash = bcrypt.hashSync(password, 8);
	return hash;
};

let bscryptCompare = (hash, password) => {
	return bcrypt.compareSync(password, hash);
};

let md5Encrypt = (data) => {
	return crypto.createHash('md5').update(data).digest('hex');
};

let aesEncrypt = (plainText, password) => {
	const cipher = crypto.createCipher('aes256', password);
	let encrypted = cipher.update(plainText, 'utf8', 'base64');
	encrypted += cipher.final('base64');

	return encrypted;
};

let aesDecrypt = (encrypted, password) => {
	try {
		const decipher = crypto.createDecipher('aes256', password);

		let decrypted = decipher.update(encrypted, 'base64', 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	} catch (e) {
		return '';
	}
};

let sha256Encrypt = (plainText) => {
	const hash = crypto.createHash('sha256')
	hash.update(plainText)
	return hash.digest('hex')
};

let hmacEncrypt = (plainText, secretKey) =>{
	const hmac = crypto.createHmac('sha256', secretKey);
	hmac.update(plainText);
	return hmac.digest('hex');
}

module.exports = {
	bcriptEncrypt,
	bscryptCompare,
	md5Encrypt,
	aesEncrypt,
	aesDecrypt,
	sha256Encrypt,
	hmacEncrypt,
};
