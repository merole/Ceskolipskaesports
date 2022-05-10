const express = require('express');
const router = express.Router();
const { Server, Socket } = require("socket.io");
const User = require('../models/user.js');
var crypto = require('crypto'); 
require('dotenv').config();

router.post("/login", (req, res, next) => {
    
    const {name, password} = req.body;

    User.find( { name: name})
      .then((result) => {
        if (result.pass == crypto.pbkdf2Sync(password, result.salt, 1000, 64, process.env.PASS_HASH).toString(`hex`)) {
            res.redirect("")
        }
      })
    res.send("this will be a login handler, that redirects to a userpage");
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
            salt: salt
        }
    );

    user.save()
      .then((console.log("Posteed" + name)))
      .then(res.redirect("/"));
});

module.exports  = router;