const mongoose = require('mongoose');
const transfer = mongoose.Schema({
    fromwalletid:{
        type: String,
        required:true
    },

    amount:{
        type: String,
        required:true
    },

    towalletid:{
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
    },

    wallet:{
        type: String,
        required:true
    },

    fund:{
        type: String,
        required:true
    },
    
    createdOn:{
        type:Date
    }

});
module.exports = mongoose.model('tranfers', transfer);