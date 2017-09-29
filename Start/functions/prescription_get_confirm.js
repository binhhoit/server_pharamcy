'presciption_post'

const prescription = require('../models/Prescription');
const errors = require('../models/Errors');

exports.prescriptionGet = (id, boolean) =>
    //
    new Promise((resolve, reject) => {
        if (id == 'all') {
            prescription.find({ status: boolean })

                .then(prescriptions => {
                    resolve(prescriptions);
                })

                .catch(err => reject(errors(2500, 'Internal Server Error !')))

        }
        else {
            prescription.find({ id: id, status: boolean })

                .then(prescriptions => {
                    resolve(prescriptions);
                })

                .catch(err => reject(errors(2500, 'Internal Server Error !')))

        }

    });
        //
