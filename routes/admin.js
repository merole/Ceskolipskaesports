// @ts-check
// Packages
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.js');
const Match = require('../models/match.js');

require('dotenv').config();
//-------

module.exports = router;