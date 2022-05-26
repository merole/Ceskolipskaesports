// @ts-check
// Packages
// TODO tidy up
// TODO this should really be called "account.js"...
const User = require('../models/user');
const Match = require('../models/match');
const crypto = require('crypto');
const router = require("express")();
const passport = require('passport');
const logger = require('../modules/logger.js');
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);

router.set('views', '../frontend/views/user');

require('dotenv').config();
//------

router.get("/", (req, res, next) => {
    if (req.isAuthenticated()) {
        // @ts-ignore
        let match = Match.find({ $or: [{player1: req.user.name}, {player2: req.user.name}]})
         .then((result) => {
            res.render("profile", {user: req.user, matches: result});
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
        let {new_name, new_email, new_password, new_discord} = req.body;
        User.find({name: new_name})
        .then((result) => {
            if (result.length == 0) {
                // Create object for setting
                // @ts-ignore
                [{name: new_name}, {email: new_email}, {password: new_password ? crypto.pbkdf2Sync(new_password, req.user.salt, 10000, 64, process.env.PASS_HASH).toString("hex") : null}, {discord: new_discord}].forEach((e) => {
                    if (e[Object.keys(e)[0]]) {
                        console.log(e)
                        // @ts-ignore
                        User.findByIdAndUpdate(req.user.id, {$set: e}, (err) => {if (err) {logger.error(err);}});
                    }
                });
                // @ts-ignore
                req.logout(function(err) {
                    if (err) { return next(err); }
                  res.redirect('/login');
                });
            } else {
                res.render("settings", {user: req.user, messages: ["Jméno již existuje"]})
            }
        });
    } else {
        res.redirect("/login");
    }
})

module.exports = router;