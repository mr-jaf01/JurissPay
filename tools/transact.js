const wallet = require('../models/wallets');
const transfer_transact = require('../models/transfer_transact');




const transferfunc = (req,res,fromwallet,amt)=>{
    wallet.findOne({wallet:fromwallet}).then((result)=>{
        var currentBal = parseFloat(result.fund);
        var amttosend = parseFloat(amt);
        if( currentBal > 0.00 && currentBal >= amttosend){
            currentBal  = currentBal - amttosend;
            wallet.findByIdAndUpdate({_id:result.id},{fund:parseFloat(currentBal)}).then((rs)=>{
               wallet.findById({_id:req.body.accnumber}).then((creditAcc)=>{
                  var creditedBal = parseFloat(creditAcc.fund);
                  creditedBal = creditedBal + amttosend;
                  wallet.findOneAndUpdate({wallet:creditAcc.wallet}, {fund:creditedBal}).then((credRs)=>{
                    const trans_history = new transfer_transact({
                        fromwalletid:fromwallet,
                        amount:amttosend,
                        towalletid:credRs.wallet,
                        credited:'yes',
                        date: Date.now(),
                        reference: Date.now().toString()
                    });
                    trans_history.save().then((history)=>{
                         res.redirect('/services/transfer/jpay/success?callback=Transfer Successfully');
                    }).catch((err)=>{
                        console.log(err);
                    })

                  
                  }).catch((err)=>{
                    console.log('Can not Credited to Wallet Account');
                  });
                   
               }).catch((err)=>{
                    console.log('Can not Find Credited wallet');
               });

            }).catch((err)=>{
                console.log('Can not Update The from wallet balance');
            });

            
        }else{
            res.redirect('/services/transfer/jpay/error?callback=Insufficient Funds');
            console.log('Can not Transfer Money');
        }
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = {
    transferfunc
}