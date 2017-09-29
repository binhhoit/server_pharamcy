'use strict';

const user = require('../models/User');
const errors = require('../models/Errors');

exports.updateProfile = (data) =>

	new Promise((resolve, reject) => {

		user.find({ _id: data._id })

			.then(users => {
				console.log(users[0])
				let user = users[0];
				user.phone = data.phone;
				user.address = data.address;
				user.birthday = data.birthday;
				return user.save();
			})
			.then(user => {
				resolve('update data profile success!');
			})
			.catch(err => reject(errors(2500, 'Internal Server Error !')))

	});