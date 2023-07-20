// @ts-check
// Packages
const Match = require('../models/match');
const Player = require('../models/player');
const router = require("express")();
const passport = require('passport');
const multer = require("multer");
const fs = require("fs");
const flash = require("connect-flash");
const logger = require('../modules/logger.js');
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);

router.set('views', '../frontend/views/minec');

require('dotenv').config();
//------

router.get("/", (req, res, next) => {

    res.render("info.ejs", {user: null});

});

module.exports = router