'use strict';

const user = require('../models/User');
const bcrypt = require('bcryptjs');
const errors = require('../models/Errors');

exports.registerUser = (name, email, password) =>

	new Promise((resolve, reject) => {

		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		const newUser = new user({
			name: name,
			email: email,
			hashed_password: hash,
			created_at: new Date()
		});

		newUser.save(function (err, doc) {
			console.log(err);
			console.log(doc);
		})

			.then(() => resolve({ status: 201, message: 'User Registered Sucessfully !' }))

			.catch(err => {

				if (err.code == 11000) {

					reject(errors(2409, 'User Already Registered !'));

				} else {

					reject(errors(2500, 'Internal Server Error !'));
				}
			});
	});


