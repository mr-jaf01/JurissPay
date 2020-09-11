const mongoose = require('mongoose');
const transfer = mongoose.Schema({
    fromwalletid:{
        type: String,
        required:true
    },

    amount:{
        type: Number,
        required:true
    },

    towalletid:{
        type: String,
        required:true
    },

    credited:{
        type: String,
        required:true
    },

    date:{
        type:Date,
        required:true
    },

    reference:{
        type: String,
        required:true
    }

});
module.exports = mongoose.model('transfer_transactions', transfer);

