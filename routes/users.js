// @ts-check

const express = require('express');
const router = express.Router();
const { Server, Socket } = require("socket.io");
const User = require('../models/user.js');
var bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy
require('dotenv').config();
const { google } = require("googleapis");
let nodemailer = require('nodemailer');
const OAuth2 = google.auth.OAuth2;
const url = require("url");
const passport = require('passport');
//------

// Passport setup required by login
const initializePassport = require('../modules/auth_init');
initializePassport(passport);

//Mail setup required by register

// Setup for transporter for sending confim emails
async function createTransporter() {
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENTID,
    process.env.OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :(");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  });

  return transporter;
};

router.post("/login", passport.authenticate('local', {
  successRedirect: '/users',
  failureRedirect: '/login'
}));

router.post("/register", (req, res, next) => {

    // req body
    const {name, email, password, password2} = req.body;

     // Creating a unique salt for a particular user 
    const salt = bcrypt.genSaltSync(1000);
  
     // Hashing user's salt and password with 1000 iterations, 
    let hash = bcrypt.hashSync(password, salt);

    const user = new User(
        {
            name: name,
            email: email,
            password: hash,
            active: false
        }
    );

    let errors = [];
    console.log(User.exists( {email: "hhh" }, (err) => {if(err) {console.log(err);}}));
    if(!name || !email || !password || !password2) {
      errors.push({type: "bg-red-700	", msg: "Please fill in all fields"})
    } 
    if (User.exists({ email: email }, (err) => {if(err) {console.log(err);}})) {
      errors.push({type: "bg-red-700	", msg: "Email already in use"});
    }
    if (User.exists({ name: name }, (err) => {if(err) {console.log(err);}})) {
      errors.push({type: "bg-red-700	", msg: "Username already in use"});
    }
    if (password !== password2) {
      errors.push({type: "bg-red-700	", msg: "Passwords don't match"});
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({type: "bg-red-700	", msg: "Invalid email adress"});
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
          await emailTransporter.sendMail(emailOptions, (err) => {if(err) {console.log(err)}});
        };
        
        sendEmail(mail_options);
        }
      );
      
    }
});

router.get("/confirm", (req, res, next) => {
  let params = url.parse(req.url,true).query;
  User.findByIdAndUpdate(params.id, { $set: {active: true}});
  res.render("confirm");
});

module.exports = router;