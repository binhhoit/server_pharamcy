'use strict';

const user = require('../models/User');
const errors = require('../models/Errors');

exports.getProfile = (id) =>

	new Promise((resolve, reject) => {

		user.find({ _id: id }, { name: 1, email: 1, created_at: 1, _id: 1, phone: 1, adrress: 1, birthday: 1, address: 1 })

			.then(users => resolve(users[0]))

			.catch(err => reject(errors(2500, 'Internal Server Error !')))

	});