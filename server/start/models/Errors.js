'error';

const errors = function (errorCode, errorMessage) {

    if (errorCode == null) {
        return null;
    } else {
        return [
            {
                errorCode: errorCode,
                errorMessage: errorMessage
            }
        ]
    }
}
module.exports = errors;



