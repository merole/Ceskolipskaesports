// @ts-check
// Packages
const router = require("express")();
const logger = require('../modules/logger.js');

router.set('views', '../frontend/views/index');

require('dotenv').config();
//-------

router.get('/login', (req, res, next) => {
  // For some reason passport.js in init.js appends cb message to this
  // Instead of creating a new thing
  // Also there is zero documentation for this so ¯\_(ツ)_/¯
  // "Nehas, co nepálí"
  // TODO properly add send email again
  // @ts-ignore
  if (req.session.flash && req.session.flash.error) {
    // @ts-ignore
    res.render('../users/login', {messages: [req.session.flash.error.slice(-1)], type: "alert"});
  } else {
    res.render('../users/login', {messages: null});
  }
});

router.get('/register', (req, res, next) => {
    res.render('../users/register', {messages: null});
});

router.get('/contact', (req, res, next) => {
  if (req.isAuthenticated()) {
    // @ts-ignore
    res.render("contact", {user: req.user});
  } else {
    res.render("contact", {user: null});
  }
});

router.get('/about', (req, res, next) => {
  if (req.isAuthenticated()) {
    // @ts-ignore
    res.render("about", {user: req.user});
  } else {
    res.render("about", {user: null});
  }
});

router.get('/about-app', (req, res, next) => {
  if (req.isAuthenticated()) {
    // @ts-ignore
    res.render("about_app", {user: req.user});
  } else {
    res.render("about_app", {user: null});
  }
});

router.get('/', (req, res, next) => {
  if (req.isAuthenticated()) {
    // @ts-ignore
    res.render("home", {user: req.user});
  } else {
    res.render("home", {user: null});
  }
});

module.exports = router;