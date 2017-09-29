'use strict';
const mongoose = require('./MongooDB');
const userSchema = mongoose.Schema({

	name: String,
	email: String,
	hashed_password: String,
	created_at: String,
	temp_password: String,
	temp_password_time: String,
	phone: String,
	address: String,
	birthday: String

});
module.exports = mongoose.model('user', userSchema);

