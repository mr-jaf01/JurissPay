const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const Authen = require('./tools/Authenticate');
const { Router } = require('express');
//const bcrypt = require('bcrypt');
//const saltRounds = 10;

//--------------- DB Models Import-------//
//const customer = require('./models/customers');

//--------------------Model end ----------//


const app = express();
const dburl  = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet';
//-------db connecttion---/////
mongoose.connect(dburl, {useNewUrlParser: true, useUnifiedTopology: true })
        .then((result)=>{
            console.log('connected to Database');
        }).catch((err)=>{
            console.log('Cannot Connect to DBserver');
});
//--------------------//

///-----------app middleware------------// 
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_KEY, resave:false, saveUninitialized:true}));
app.use(layouts);

///------------------------------//



///App Route-------//////

app.get('/', (req,res)=>{
    res.render('login/login',{info:req.query.info});
});

app
.route('/auth/login')
.get((req,res)=>{
    res.render('login/login', {info:req.query.info});
})
.post((req,res)=>{
    Authen.WalletLogin(req,res);
});


app
.route('/auth/createWallet')
.get((req,res)=>{
    res.render('signup/signup',{info:req.query.callback});
})
.post((req,res)=>{
    Authen.NewWallet(req,res);
});







///------------------------------///

///------------------Port Listen----------////
app.listen(process.env.PORT, ()=>{
    console.log('JurissPay Server Started');
})
