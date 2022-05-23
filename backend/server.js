// @ts-check
// Packages
const express = require("express");
const mongoose = require('mongoose'); 
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require('passport');
// Probably required
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');


require('dotenv').config();
//-------

//app init
const app = express();
app.use(express.urlencoded({extended : false}));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//mongoose
const db_string = process.env.DB_STRING
// @ts-ignore
mongoose.connect(db_string, {useNewUrlParser: true, useUnifiedTopology : true})
.then(() => app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT} and connected to DB!`)))
.catch((err)=> console.log(err));                                                                                

// Session middleware setup, this is used by protected URLs, such as /user in users.js
let sessionStore = MongoStore.create({
    mongoUrl: db_string,
    collectionName: "sessions",
});
app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      store: sessionStore,
    })
  );
  app.use(passport.authenticate('session'));

// Passport setup for login and cookies
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('../frontend/static'));



// Routers
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/cr', require('./routes/cr'));
