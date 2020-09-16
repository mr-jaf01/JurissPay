const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const enforce = require('express-sslify');
const { Router } = require('express');
const lifetime = 1000 * 60 * 60 *2;
const Sess_name = 'sid';
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.PUBLIC_KEY, process.env.SECRET_KEY, true);



//--------------- DB Models Import-------//
const wallet = require('./models/wallets');
const transfer_transact = require('./models/transfer_transact');
//--------------------Model end ----------//


//----------------------Services Tools models ----------//
const Authen = require('./tools/Authenticate');
const transact = require('./tools/transact');
//-------------------------end service tolls here------------//

const app = express();
app.use(enforce.HTTPS({ trustProtoHeader: true }));


const dburl  = process.env.MONGODB_URI  || 'mongodb://localhost:27017/wallet';
//--------------db connecttion---------------------------//
mongoose.connect(dburl, {useNewUrlParser: true, useUnifiedTopology: true })
        .then((result)=>{
            app.listen(process.env.PORT, ()=>{
                console.log('JurissPay Server Started');
                console.log('connected to Database');
            });            
        }).catch((err)=>{
            console.log('Cannot Connect to DBserver');
});
mongoose.set('useFindAndModify', false);
//--------------db connection end hereee----------------//



///-----------app middleware------------// 
app.use(session({
    name : Sess_name,
    resave:false,
    saveUninitialized:false,
    secret: process.env.SESSION_KEY,
    cookie:{
        //name:'session',
        maxAge: lifetime,
        sameSite: true,
        secure: false   
    }
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(layouts);
///------------------------------//



///------------App Route----------//////
app.get('/', (req,res)=>{
    if(req.session.walletID){
        res.redirect('/dashboard');
    }else{
        res.render('login/login', {info:req.query.info});
    }
});

app
.route('/auth/login')
.get((req,res)=>{
    if(req.session.walletID){
        res.redirect('/dashboard');
    }else{
        res.render('login/login', {info:req.query.info});
    }
    
})
.post((req,res)=>{
   Authen.WalletLogin(req,res);
  
});


app
.route('/auth/createWallet')
.get((req,res)=>{
    if(req.session.walletID){
        res.redirect('/auth/login');
    }else{
        res.render('signup/signup',{info:req.query.callback});
    }
    
})
.post((req,res)=>{
    Authen.NewWallet(req,res);
});

app.get('/auth/logout', (req,res)=>{
    req.session.destroy(err =>{
        if(err){
            res.redirect('/dashboard');
        }else{
            res.clearCookie(Sess_name);
            res.redirect('/auth/login');
            console.log('Logout Successfully');
        }
    });
});

app.get('/dashboard', (req,res)=>{
    if(req.session.walletID){
        wallet.find({wallet:req.session.walletID})
            .then((result)=>{
                res.render('dashboard/wallet', {walletinfo:result});
            }).catch((err)=>{
                console.log(err);
            })
        
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});


//--------------- Send Money Services Routes------------------------//
app.get('/services/sendmoney', (req,res)=>{
    if(req.session.walletID){
        res.render('sendmoney/sendmoney');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    } 
});

app.route('/services/transfer/jpay')
.get( (req,res)=>{
    if(req.session.walletID){
        res.render('sendmoney/jpay', {info:req.query.callback});
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    } 
})
.post((req,res)=>{
    const acc_num = req.body.accnumber;
    wallet.findOne({wallet:acc_num})
        .then((result)=>{
            res.redirect('/services/transfer/jpay/confirm?wid='+result.id);
        }).catch((err)=>{
            res.redirect('/services/transfer/jpay?callback=Oops! Wallet Account Not Found');
        })
});

app.route('/services/transfer/jpay/confirm')
.get((req,res)=>{
    if(req.session.walletID){
        wallet.findById(req.query.wid)
        .then((result)=>{
            res.render('sendmoney/confirm', {AccDetails:result});
        }).catch((err)=>{
          res.redirect('/services/transfer/jpay?callback=Oops! Wallet Account Not Found');  
        })
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    } 
})
.post((req,res)=>{
    const fromwallet = req.session.walletID;
    //const towallet = req.body.accnumber;
    const amt = req.body.amt;
    transact.transferfunc(req,res, fromwallet, amt);
});

app.get('/services/transfer/jpay/error', (req,res)=>{
    if(req.session.walletID){
       res.render('sendmoney/error', {info:req.query.callback});
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    } 
});

app.get('/services/transfer/jpay/success', (req,res)=>{
    if(req.session.walletID){
       res.render('sendmoney/success', {info:req.query.callback});
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    } 
});
//--------------- Send Money Services Routes end Here------------------------//







//---------------Services Routes here----------//
app.get('/services/transactions', (req, res)=>{
    if(req.session.walletID){
        transfer_transact.find({
            $or:[{fromwalletid:req.session.walletID}]
        }).sort({ date: -1}).then((result)=>{
            res.render('dashboard/transaction', {DebitAlert:result});
        }).catch((err)=>{
            console.log(err);
        });

    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});

app.get('/services/update', (req, res)=>{
    if(req.session.walletID){
        res.render('dashboard/update');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});

app.route('/services/top-up')
.get((req, res)=>{
    if(req.session.walletID){
        res.render('dashboard/topup');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
})
.post((req, res)=>{
    wallet.findOne({wallet:req.session.walletID}).then((result)=>{
        const payload = {
            "tx_ref": Date.now().toString(), //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
            "amount": req.body.amount, //This is the amount to be charged.
            "account_bank": req.body.bname, //This is the Bank numeric code. You can get a list of supported banks and their respective codes Here: https://developer.flutterwave.com/v3.0/reference#get-all-banks
            "account_number":req.body.bnum,
            "currency": "NGN",
            "email": result.email,
            "phone_number": result.phone, //This is the phone number linked to the customer's mobile money account
            "fullname": result.fname
        }
        flw.Charge.ng(payload).then((responds)=>{
            res.redirect(responds.data['auth_url']);
            //console.log(responds);
        }).catch((err)=>{
            res.redirect('/services/transfer/jpay/error?callback=Can Not Complete Your Transaction');
        })

    }).catch((err)=>{
        console.log('Wallet Not Found');
    })
});



app.get('/services/cash-out', (req, res)=>{
    if(req.session.walletID){
        res.render('dashboard/cashout');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});

app.get('/services/quickPay', (req, res)=>{
    if(req.session.walletID){
        res.render('dashboard/quickpay');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});

app.get('/services/manageCards', (req, res)=>{
    if(req.session.walletID){
        res.render('dashboard/cards');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});

app.get('/services/support', (req, res)=>{
    if(req.session.walletID){
        res.render('dashboard/help');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});
app.get('/services/wallet-profile', (req,res)=>{
    if(req.session.walletID){
        res.render('dashboard/profile');
    }else{
        res.redirect('/auth/login');
        console.log('Please Login to wallet');
        
    }
});
//------------services Routes End here-----------//






