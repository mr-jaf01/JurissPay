const bcrypt = require('bcrypt');
const session = require('express-session');
//--------------- DB Models Import-------//
const Wallet = require('../models/wallets');
const saltRounds = 10;

// Creating New Wallet
const NewWallet = function(req,res){
    const wa = Date.now().toString().slice(-8);
    const wallet_id = '00'+wa;
    const  fname = req.body.fname;
    const  phone = req.body.phone;
    const  email = req.body.email;
    const  pass = req.body.password
    const  cpass = req.body.cpassword;
    if(pass === cpass){
        bcrypt.hash(cpass, saltRounds, (err,hash)=>{
            const newCus = new Wallet({
                fname:fname,
                phone:phone,
                email:email,
                address:'',
                password:hash,
                wallet:wallet_id,
                createdOn:Date.now()
            });
            // checking if wallet Exites with Register Email or Phone
            Wallet.findOne({
                $or:[{email:email},{phone:phone}]
            }).then((result)=>{
                if(result === null){
                    newCus.save()
                    .then((result)=>{
                        console.log('Wallet Created');
                        res.redirect('/auth/login?info=Wallet Created!');
                    }).catch((err)=>{
                        console.log(err);
                    });
                }else{
                    res.redirect('/auth/createWallet?callback=Wallet found with Same email and phone! Please Change');
                   console.log('Wallet Found with same Email or Phone');
                }
            }).catch((err)=>{
                console.log(err);
            })
            
        
    });
        
    }else{
        console.log('Password Mismatch');
        res.redirect('/auth/createWallet?info=Password Mismatch');
    }
}

// Wallet Login 
const WalletLogin = (req, res)=>{
    const email = req.body.emphone;
    const pass = req.body.pass;
        Wallet.findOne({
            $or:[{email:email},{phone:email}]
        }).then((result)=>{
            bcrypt.compare(pass, result.password, (err, done)=>{
                if(done){
                    session.walletID = result.wallet;
                    res.redirect('/dashboard')
                }else{
                    res.redirect('/auth/login?info=Incorrect Wallet Password');
                    console.log('Wrong password');
                }

            });

           
        }).catch((err)=>{
            console.log('User not Found!');
            res.redirect('/auth/login?info=Wallet not Found!');
        });
}

// -----------exported functions ---------///
module.exports = {
    NewWallet, WalletLogin
}