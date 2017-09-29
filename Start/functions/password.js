'use strict';

const user = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");
const config = require('../config/config.json');
const errors = require('../models/Errors');


exports.changePassword = (id, password, newPassword) =>

	new Promise((resolve, reject) => {

		user.find({ _id: id })
			.then(users => {

				let user = users[0];
				const hashed_password = user.hashed_password;

				if (bcrypt.compareSync(password, hashed_password)) {

					const salt = bcrypt.genSaltSync(10);
					const hash = bcrypt.hashSync(newPassword, salt);

					user.hashed_password = hash;

					return user.save();

				} else {

					reject(errors(2156, 'Invalid Old Password !'));
				}
			})
			.then(user => resolve({ status: 200, message: 'Password Updated Sucessfully !' }))
			.catch(err => reject(errors(2500, 'Internal Server Error !')))

	});

exports.resetPasswordInit = (email) =>

	new Promise((resolve, reject) => {

		const random = randomstring.generate(8);

		user.find({ email: email })

			.then(users => {
				if (users.length == 0) {
					reject(errors(2677, 'User Not Found !'));
				} else {
					let user = users[0];

					const salt = bcrypt.genSaltSync(10);
					const hash = bcrypt.hashSync(random, salt);

					user.temp_password = hash;
					user.temp_password_time = new Date();

					return user.save();
				}
			})

			.then(user => {
				const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);
				const mailOptions = {
					from: `"${config.name}" <${config.email}>`,
					to: email,
					subject: 'Reset Password Request ',
					html: `Hello ${user.name},<br><br>
    			&nbsp;&nbsp;&nbsp;&nbsp; Your reset password token is <b>${random}</b>. 
    			If you are viewing this mail from a Android Device click this <a href = "http://${config.ip}/api/deeplink/${user.email}/${random}">link</a>.
				The token is valid for only 2 minutes.<br><br>
    			Thanks,<br>
    			Online Phamacy team.`
				};
				console.log(mailOptions);
				return transporter.sendMail(mailOptions);

			})

			.then(info => {
				console.log(info);
				resolve({ status: 200, message: 'Check mail for instructions' })
			})

			.catch(err => {
				reject(errors(2500, 'Internal Server Error !'))
			});
	});

exports.resetPasswordFinish = (email, token, password) =>

	new Promise((resolve, reject) => {

		user.find({ email: email })

			.then(users => {

				let user = users[0];

				const diff = new Date() - new Date(user.temp_password_time);
				const seconds = Math.floor(diff / 1000);
				console.log(`Seconds : ${seconds}`);

				if (seconds < 120) {

					return user;

				} else {

					reject(errors(2031, 'Time Out ! Try again'));
				}
			})

			.then(user => {

				if (bcrypt.compareSync(token, user.temp_password)) {

					const salt = bcrypt.genSaltSync(10);
					const hash = bcrypt.hashSync(password, salt);
					user.hashed_password = hash;
					user.temp_password = undefined;
					user.temp_password_time = undefined;

					return user.save();

				} else {

					reject(errors(2020, 'Invalid Token !'));
				}
			})

			.then(user => resolve({ status: 200, message: 'Password Changed Sucessfully !' }))

			.catch(err => reject(errors(2500, 'Internal Server Error !')))

	});