let checkValidatePassword = (password) => {
	let error = []
	if (password == '') {
		error.push('Error: Username cannot be blank!')
	}
	let re = /^\w+$/
	if (!re.test(password)) {
		error.push('Error: Username must contain only letters, numbers and underscores!')
	}
	if (password < 8) {
		error.push('Error: Password must contain at least 8 characters!')
	}
	re = /[0-9]/
	if (!re.test(password)) {
		error.push('Error: password must contain at least one number (0-9)!')
	}
	re = /[a-z]/
	if (!re.test(password)) {
		error.push('Error: password must contain at least one lowercase letter (a-z)!')
	}
	re = /[A-Z]/
	if (!re.test(password)) {
		error.push('Error: password must contain at least one uppercase letter (A-Z)!')
	}
	return error
}

let validateEmail = (email) => {
	let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return re.test(email)
}
module.exports = {
	checkValidatePassword,
	validateEmail
}
