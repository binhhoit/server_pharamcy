'presciptionPhoto_post'

const prescription = require('../models/PrescriptionPhoto');
const errors = require('../models/Errors');

exports.prescriptionPhotoPost = (body) =>
    //
    new Promise((resolve, reject) => {
        console.log("Toa Thuốc : ");
        var prescriptions = new prescription(body)
        prescriptions.save(function (error, data) {

            if (error != null) {
                console.log(error);
                reject(error(2217, 'Sever do not save data'));
            } else {
                console.log("thêm mới :" + data);
                resolve({ status: 200, message: 'success' });

            }
        })

    });
        //



