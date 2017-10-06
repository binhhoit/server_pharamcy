const mongoose = require('../models/MongooDB');

const prescriptionSchema = mongoose.Schema({

	id: String,
	email: String,
	addressReceive: String,
	phone: String,
	name: String,
	numberBuy: String,
    status:String,
    photo:String,	

});

module.exports = mongoose.model('prescriptionPhoto', prescriptionSchema);