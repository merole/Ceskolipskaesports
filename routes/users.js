const express = require('express');
const router = express.Router();
const { Server, Socket } = require("socket.io");
const User = require('../models/user.js');
var crypto = require('crypto'); 
require('dotenv').config();
let nodemailer = require('nodemailer');
//------

//Mail setup
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

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
    
    if(!name || !email || !password || !password2) {
      errors.push({type: "error", msg: "Please fill in all fields"})
    } 
    if (User.find({ email: email })._id) {
      errors.push({type: "error", msg: "Email already in use"});
      User.find({ email: email }).then((result) => {console.log(result + "email fail")} );
    }
    if (User.find({ name: name })._id) {
      errors.push({type: "error", msg: "Username already in use"});
      User.find({ name: name }).then((result) => {console.log(result + "name fail")} )
    }
    if (password !== password2) {
      errors.push({type: "error", msg: "Passwords don't match"});
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({type: "error", msg: "Invalid email adress"});
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
      .then((console.log("Posteed" + name)))
      .then(res.redirect("/login"))
      .then(User.find( { name: name }))
      .then((result) => {
        console.log("-----------");
        console.log(result);
        i = result;
        id = i._id;
        mail_options = {
          from: process.env.MAIL,
          to: email,
          subject: 'Potvrďte svůj účet',
          text: "Potvrďte zde: " + process.env.URL + "users/confirm/" + id
        }
        transporter.sendMail(mail_options, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('New user: ' + name + " Info: " + info.response);
          }
        });

        }
      );
      
    }
});

module.exports = router;