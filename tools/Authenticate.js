const bcrypt = require('bcrypt');
const session = require('express-session');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.ENAME,
        pass:process.env.EPASS
    }
});
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
                fund: 0.00,
                createdOn:Date.now()
            });
            // checking if wallet Exites with Register Email or Phone
            Wallet.findOne({
                $or:[{email:email},{phone:phone}]
            }).then((result)=>{
                if(result === null){
                    newCus.save()
                    .then((result)=>{
                        const output = `
                        <div class="row" style=" margin-bottom:100px; padding-left:20px; padding-right:20px; height:100%; display: flex; padding-top: 30px; flex-direction: column; align-items: center;">
                        <style>
                            
                .table {
                  width: 100%;
                  margin-bottom: 1rem;
                  color: #212529;
                }
                
                .table th,
                .table td {
                  padding: 0.75rem;
                  vertical-align: top;
                  border-top: 1px solid #dee2e6;
                }
                
                .table thead th {
                  vertical-align: bottom;
                  border-bottom: 2px solid #dee2e6;
                }
                
                .table tbody + tbody {
                  border-top: 2px solid #dee2e6;
                }
                
                .table-sm th,
                .table-sm td {
                  padding: 0.3rem;
                }
                
                .table-bordered {
                  border: 1px solid #dee2e6;
                }
                
                .table-bordered th,
                .table-bordered td {
                  border: 1px solid #dee2e6;
                }
                
                .table-bordered thead th,
                .table-bordered thead td {
                  border-bottom-width: 2px;
                }
                
                        </style>
                        <div>
                            <img src="https://jurisspay.herokuapp.com/images/jPayww.png" width="200" />
                        </div>
                        <h4 style="margin-top: 10px; ">Wallet Account Details</h4>
                        <div>
                            <table class="table table-bordered" style="">
                                <tr>
                                    <td>Wallet Account Number</td>
                                    <td>${result.wallet}</td>
                                </tr>
                                <tr>
                                    <td>Wallet Account Name</td>
                                    <td >${result.fname}</td>
                                </tr>
                
                                <tr>
                                    <td>Email</td>
                                    <td >${result.email}</td>
                                </tr>
                
                                <tr>
                                    <td>Phone</td>
                                    <td >${result.phone}</td>
                                </tr>
                            </table>
                        </div>
                       
                        <div style="">
                            <center><p>Support: <br> https://jurisspay.herokuapp.com/</p></center>
                            <center><p>Contacts:<br> +2348132911690, +2348086587066</p></center>
                        </div>
                        
                    </div>
                        `;
                        const mailOption = {
                            from: process.env.ENAME,
                            to:email,
                            subject:'Thanks You For Signing Up with JurissPay.io',
                            text: '',
                            html:output
                        }
                        transporter.sendMail(mailOption)
                        .then((done)=>{
                            console.log('Email Send Successfully');
                        }).catch((err)=>{
                            console.log('Email Not Send');
                        });
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
                    req.session.walletID = result.wallet;
                    res.redirect('/dashboard'); 
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