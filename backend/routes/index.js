// @ts-check
// Packages
const router = require("express")();

router.set('views', '../frontend/views');
router.set('views', '../frontend/views/index');

require('dotenv').config();
//-------

router.get('/login', (req, res) => {
  // For some reason passport.js in init.js appends cb message to this
  // Instead of creating a new thing
  // Also there is zero documentation for this so ¯\_(ツ)_/¯
  // "Nehas, co nepálí"
  // @ts-ignore
  if (req.session.flash && req.session.flash.error) {
    // @ts-ignore
    res.render('../users/login', {messages: req.session.flash.error.slice(-1)});
  } else {
    res.render('../users/login', {messages: null});
  }
});

router.get('/register', (req, res) => {
    res.render('../users/register');
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