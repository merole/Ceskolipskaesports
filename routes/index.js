const express = require('express');
const router = express.Router();
require('dotenv').config();
const passport = require('passport');


router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/home', passport.authenticationMiddleware(), (req, res) => {
    res.render('home');
})
module.exports = router;