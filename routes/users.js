const express = require('express');
const router = express.Router();
const { Server, Socket } = require("socket.io");
const User = require('../models/user.js');
var crypto = require('crypto'); 
require('dotenv').config();
const { google } = require("googleapis");
let nodemailer = require('nodemailer');
const OAuth2 = google.auth.OAuth2;
//------

//Mail setup required by register

// Setup for transporter
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


router.post("/login", (req, res, next) => {
    
    const {name, password} = req.body;

    User.find( { name: name })
      .then((result) => {
          i = result[0]
          console.log(i);
          if (i.pass == crypto.pbkdf2Sync(password, i.salt, 1000, 64, process.env.PASS_HASH).toString(`hex`) && i.active) {
              res.redirect("/users/home")
          }
      });
});

router.post("/register", (req, res, next) => {

    // req body
    const {name, email, password, password2} = req.body;

     // Creating a unique salt for a particular user 
    let salt = crypto.randomBytes(16).toString('hex'); 
  
     // Hashing user's salt and password with 1000 iterations, 
    hash = crypto.pbkdf2Sync(password, salt, 1000, 64, process.env.PASS_HASH).toString(`hex`);
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
    console.log(User.exists({ email: email }));
    if(!name || !email || !password || !password2) {
      errors.push({type: "bg-red-700	", msg: "Please fill in all fields"})
    } 
    if (User.exists({ email: email })) {
      errors.push({type: "bg-red-700	", msg: "Email already in use"});
    }
    if (User.exists({ name: name })) {
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
        console.log("-----------");
        console.log(result);
        i = result;
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
          await emailTransporter.sendMail(emailOptions);
        };
        
        sendEmail(mail_options);
        }
      );
      
    }
});

router.post("/confirm", (req, res, next) => {
  res.render("confirm");
});

module.exports = router;