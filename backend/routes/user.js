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

router.get("/", (req, res, next) => {
    if (req.isAuthenticated()) {
        // @ts-ignore
        let match = Match.findOne({ $or: [{player1: req.user.name}, {player2: req.user.name}]})
         .then((result) => {
            res.render("profile", {user: req.user, match: result});
         });
        
    } else {
        res.redirect("/login");
    }
});

router.get("/settings", (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render("settings", {user: req.user});
    } else {
        res.redirect("/login");
    }
});

router.post("/settings", (req, res, next) => {
    if (req.isAuthenticated()) {
        let {name_val, email_val, password_val} = req.body;
        // @ts-ignore
        [{name: name_val}, {email: email_val}, {password: password_val ? crypto.pbkdf2Sync(password_val, req.user.salt, 10000, 64, process.env.PASS_HASH).toString("hex") : null}].forEach((e) => {
            if (e[Object.keys(e)[0]]) {
                console.log(e)
                // @ts-ignore
                User.findByIdAndUpdate(req.user.id, {$set: e}, (err) => {if (err) {console.log(err);}});
            }
        });
        req.logout();
        res.redirect("/user");
    } else {
        res.redirect("/login");
    }
})

module.exports = router;