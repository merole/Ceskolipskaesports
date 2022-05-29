// @ts-check
// Packages
// TODO this should really be called "account.js"...
const User = require('../models/user');
const Match = require('../models/match');
const Player = require('../models/player');
const crypto = require('crypto');
const router = require("express")();
const passport = require('passport');
const logger = require('../modules/logger.js');
// This is proably required
// @ts-ignore
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);

router.set('views', '../frontend/views/user');

require('dotenv').config();
//------

// @ts-ignore
router.get("/", (req, res, next) => {
    if (req.isAuthenticated()) {
        // @ts-ignore
        Match.find({ $or: [{player1: req.user.name}, {player2: req.user.name}]})
         .then((result) => {
            // @ts-ignore
            Player.findOne({name: req.user.name})
            // Only for cr tournament
            .then((player) => {
                // @ts-ignore
                res.render("profile", {user: req.user, matches: result, messages: undefined, playing: player ? player.active : false});
            });
         });
        
    } else {
        res.redirect("/login");
    }
});

// @ts-ignore
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
                res.render("settings", {user: req.user, messages: ["Jméno již existuje"], type: "alert"})
            }
        });
    } else {
        res.redirect("/login");
    }
})

module.exports = router;