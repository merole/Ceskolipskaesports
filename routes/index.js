// @ts-check
// Packages
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.js');
const Match = require('../models/match.js');

require('dotenv').config();
//-------


router.get('/login', (req, res) => {
  console.log(req);
  // For some reason passport.js in init.js appends cb message to this
  // Instead of creating a new thing, I have no words
  // @ts-ignore
  res.render('login', {messages: req.session.flash.error.slice(-1)});
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/home', (req, res, next) => {
  let match = new Match(
    {
      player1: "627ff1868192c01bfca7d100",
      player2: "627fe69aa2ca93781f8b897a"
    }
  );
  if (req.isAuthenticated()) {
    // @ts-ignore
    let name = req.user.name;
    Match.find({$or: [{player1: name}, {player2: name}]},
        (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    })

  } else {
    res.render("login");
  }
});
module.exports = router;