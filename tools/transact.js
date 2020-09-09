const wallet = require('../models/wallets');
const transfer_transact = require('../models/transfer_transact');



const transferfunc = (req,res,fromwallet,towallet,amt)=>{
    wallet.findOne({wallet:fromwallet}).then((result)=>{
        if(result.fund > 0.00 && result.fund > amt){

        }else{
            res.redirect('/services/transfer/jpay/error?callback=Insufficient Funds');
            console.log('can not Transfer Money');
        }
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = {
    transferfunc
}