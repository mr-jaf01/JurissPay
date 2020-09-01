const mongoose = require('mongoose');
const CustomerScheme = mongoose.Schema({
    fname:{
        type: String,
        required:true
    },

    phone:{
        type: String,
        required:true
    },

    email:{
        type: String,
        required:true
    },

    address:{
        type: String
    },

    password:{
        type: String,
        required:true
    },

    wallet:{
        type: String,
        required:true
    },
    createdOn:{
        type:Date
    }

});

module.exports = mongoose.model('wallets', CustomerScheme);