// @ts-check
// Packages
// TODO tidy up
const User = require('../models/user');
const Match = require('../models/match');
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

router.set('views', '../frontend/views/user');

require('dotenv').config();
//------

router.post("/upload", (req, res, next) => {
    if (req.isAuthenticated()) {
        let {img, comment, user, id} = req.body;
        Match.findById(id)
         .then((result) => {
             if (result.player1 == user) {
                 result.update({img1: img, comment1: comment}, (err) => {if (err) {console.log(err)}})
             } else if (result.player2 == user) {
             } else {
                 // TODO logging
                 console.log("error");
                 return
             }

         });
    } else {
        res.redirect("login");
    }
});

module.exports = router;