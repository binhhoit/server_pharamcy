'connect'

const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/OnlinePharmacy');
mongoose.connect('mongodb://binhhoit:123456@ds032340.mlab.com:32340/online_pharmacy');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

module.exports = mongoose;