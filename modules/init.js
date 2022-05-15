// @ts-check
// Packages
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
//-----

let init = (passport) => {
      passport.use(
        'user',
        new LocalStrategy(
            {
            usernameField: 'email',
            },
         (email, password, cb) => {
           console.log(email)
              User.findOne( {email: email})
               .then((user) => {
                   if(!user) {
                     console.log("1");
                       return cb(null, false, {message: "Nesprávné heslo nebo email"});
                   }
                   let isValid = (crypto.pbkdf2Sync(password, user.salt, 10000, 64, process.env.PASS_HASH).toString("hex") == user.password);
                   if (isValid) {
                       if (user.active) {
                        return cb(null, user);
                       } else {
                        console.log("2");
                         return cb(null, false, {message: "Prosím potvrďte email."});
                       }
                   } else {
                    console.log("3");
                       return cb(null, false, {message: "Nesprávné heslo nebo email"});
                   }
               })
                .catch((err) => {
                    cb(err);
                });
          })
      );
      passport.serializeUser(function (user, cb) {
        cb(null, user.id);
      });
      
      passport.deserializeUser(function (id, cb) {
        User.findById(id, (err, user) => {
          if (err) {
            return cb(err);
          }
          cb(null, user);
        });
      });
      
};

module.exports = init;