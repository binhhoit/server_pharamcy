'use strict';

const user = require('../models/User');
const errors = require('../models/Errors');
const bcrypt = require('bcryptjs');

exports.loginUser = (email, password) =>

	new Promise((resolve, reject) => {

		user.find({ email: email })
			.then(users => {

				if (users.length == 0) {

					reject(errors(2677, 'User Not Found !'));

				} else {

					return users[0];

				}
			})

			.then(user => {

				const hashed_password = user.hashed_password;

				if (bcrypt.compareSync(password, hashed_password)) {
					resolve({ status: 200, message: email, id: user._id });

				} else {

					reject(errors(2337, 'Invalid Credentials !'));
				}
			})

			.catch(err => reject(errors(2500, 'Internal Server Error !')))

	});


