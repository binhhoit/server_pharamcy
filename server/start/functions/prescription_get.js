'presciption_post'

const errors = require('../models/Errors');
const prescription = require('../models/Prescription');

exports.prescriptionGet = (id) =>
    //
    new Promise((resolve, reject) => {

        prescription.find({ id: id })

            .then(prescriptions => {
                resolve(prescriptions);
            })

            .catch(err => reject(errors(2500, 'Internal Server Error !')))
    });
        //
