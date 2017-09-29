const mongoose = require('../models/MongooDB');

const prescriptionSchema = mongoose.Schema({

	id: String,
	email: String,
	addressReceive: String,
	phone: String,
	name: String,
	numberBuy: String,
	status: String,
	price: String,
	prescription: [
		{
			nameMedical: String,
			number: String,
		}
	]

});

module.exports = mongoose.model('prescription', prescriptionSchema);