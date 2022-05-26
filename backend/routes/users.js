// @ts-check
// Packages
const User = require('../models/user');
const crypto = require('crypto');
const url = require("url");
const router = require("express")();
const passport = require('passport');
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);
const logger = require('../modules/logger.js');
const createTransporter = require('../modules/transporter')

router.set('views', '../frontend/views/users');

require('dotenv').config();
//------

// Passport setup used by login and protected urls


// Setup for transporter for sending confim emails


router.post('/login',
  passport.authenticate("user", { 
    failureRedirect: "/login", 
    successRedirect: "/",
    failureFlash: true })
);

router.post("/register", (req, res, next) => {
    
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
          await emailTransporter.sendMail(emailOptions, (err) => {if(err) {logger.error(err);}});
        };
        sendEmail(mail_options);
        }
      );
      
    }
});

router.get("/confirm", (req, res, next) => {
  let params = url.parse(req.url,true).query;
  User.findById(params.id).
  then((result) => {
    logger.log(`${req.user} CREATED and account`)
  })
  User.findByIdAndUpdate(params.id, { $set: {active: true}}, (err) => {err});
  res.render("login", {messages: ["Účet potvrzen"]});
});

router.post('/logout',(req, res, next)=>{
  // @ts-ignore
  req.logout(function(err) {
      if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post("/send-email", (req, res, next) => {
  res.render("send_again");
});

router.post("/send_again", (req, res, next) => {
  let {email} = req.body;
  
  User.findOne( {email: email})
   .then( (result) => {
     if (!result.active) {
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
          await emailTransporter.sendMail(emailOptions, (err) => {if(err) {logger.error(err);}});
        };
        sendEmail(mail_options);
        res.render("login", {messages: null });
      } else {
        logger.log("Someone tried to resend mail with an active account")
        res.send("no");
      }
    });
});

module.exports = router;