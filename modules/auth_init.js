const passport = require('passport');
const authMiddleware = require('./middleware');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const { ModuleResolutionKind } = require('typescript');

const init = (passport) => {
    const  authUser = async (email, password, done) => {
        const user = await User.findOne( {email: email }, (err) => {if(err){console.log(err);}});
        if (user == null) {
            return done(null, false);
        }
        try {
            if (await bcrypt.compare(password, user.pass)) {
                return done(null, user);
            } 
            else {
                return done(null, false);
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.authenticationMiddleware = authMiddleware;
    passport.use(new LocalStrategy( {usernameField: 'email'}), authUser);
    passport.serializeUser((user, done) => { });
    passport.deserializeUser((id, done) => { });
      
};

module.exports = init