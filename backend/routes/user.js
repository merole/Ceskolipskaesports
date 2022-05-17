// @ts-check
// Packages
// TODO tidy up
const User = require('../models/user');
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
        res.render("profile", {user: req.user})
    } else {
        res.redirect("login");
    }
});

router.get("/", (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render("", {user: req.user})
    } else {
        res.redirect("login");
    }
});

module.exports = router;