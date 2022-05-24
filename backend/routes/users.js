// @ts-check
// Packages
const User = require('../models/user');
const flash = require('connect-flash');
const crypto = require('crypto');
const { google } = require("googleapis");
const nodemailer = require('nodemailer');
const url = require("url");
const router = require("express")();
const passport = require('passport');
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);

router.set('views', '../frontend/views/users');

require('dotenv').config();
//------

// Passport setup used by login and protected urls


// Setup for transporter for sending confim emails
const OAuth2 = google.auth.OAuth2;
const {CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL} = 
  process.env;
const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log(err);
        reject();
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL,
      accessToken,
      clientId: CLIENT_ID,
      clientSecret:CLIENT_SECRET,
      refreshToken:REFRESH_TOKEN
    }
  });

  return transporter;
};

router.post('/login',
  passport.authenticate("user", { 
    failureRedirect: "/login", 
    // TODO redirect to /user
    successRedirect: "/",
    failureFlash: true })
);

//TODO logging
router.post("/register", (req, res, next) => {
    
  // TODO unique name
    const {name, email, password, password2} = req.body;
    let salt = crypto.randomBytes(32).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 10000, 64, process.env.PASS_HASH).toString("hex");
    // Creating a unique salt for a particular user 
    const user = new User(
        {
            name: name,
            email: email,
            password: hash,
            salt: salt,
            active: false
        }
    );

    let errors = [];
    // Sends a message, type gets put into the class param, message is the text
    if(!name || !email || !password || !password2) {
      errors.push("Vyplňte všechna pole")
    }
    User.find({ name: name })
    .then((result) => {
      if (result) {
        errors.push("E-mailová adresa se již používá");
      }
    });
    User.find({ email: email })
    .then((result) => {
      if (result) {
        errors.push("E-mailová adresa se již používá");
      }
    });
    if (password !== password2) {
      errors.push("Hesla se neshodují");
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push("Neplatná e-mailová adresa");
    }

    if (errors.length > 0) {
      res.render('register', {
        messages : errors,
        name : name,
        email : email,
        password : password,
        password2 : password2});
    }
    else {
      let id;
      let mail_options;

      user.save()
      .then((console.log("Posted" + name)))
      .then(res.redirect("/login"))
      .then(User.find( { name: name }))
      .then((result) => {
        let i = result;
        id = i._id;
        mail_options = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Potvrďte svůj účet',
          text: "Potvrďte zde: " + process.env.URL + "users/confirm/?id=" + id
        }

        // Use only with transporter
        const sendEmail = async (emailOptions) => {
          let emailTransporter = await createTransporter();
          await emailTransporter.sendMail(emailOptions, (err) => {if(err) {console.log("4")}});
        };
        // TODO check if active
        sendEmail(mail_options);
        }
      );
      
    }
});

router.get("/confirm", (req, res, next) => {
  let params = url.parse(req.url,true).query;
  console.log(params.id);
  User.findById(params.id).
  then((result) => {
    console.log(result)
  })
  User.findByIdAndUpdate(params.id, { $set: {active: true}}, (err) => {err});
  res.render("confirm");
});

router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','Now logged out');
  res.redirect('/'); 
});

router.get("/send_again", (req, res) => {
  res.render("send_again");
});

//TODO logging
router.post("/send_again", (req, res) => {
  let {email} = req.body;
  
  User.findOne( {email: email})
   .then( (result) => {
     let id = result._id;
     let mail_options = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Potvrďte svůj účet',
      text: "Potvrďte zde: " + process.env.URL + "users/confirm/?id=" + id
    }
  
    // Use only with transporter
    const sendEmail = async (emailOptions) => {
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(emailOptions, (err) => {if(err) {console.log("4")}});
    };
    // TODO check if active
    sendEmail(mail_options);
    res.render("login", {messages: null });
   });
});

module.exports = router;