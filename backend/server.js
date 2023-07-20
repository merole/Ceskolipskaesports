// @ts-check
// Packages
const express = require("express"),
 mongoose = require('mongoose'),
 session = require("express-session"),
 MongoStore = require("connect-mongo"),
 passport = require('passport'),
 winston = require('winston'),
 expressWinston = require('express-winston'),
 // Probably required
 LocalStrategy = require('passport-local').Strategy,
 logger = require('./modules/logger.js'),
 // This is used by passport.js
 flash = require('connect-flash')


require('dotenv').config();
//-------

//app init
const app = express();
app.use(express.urlencoded({extended : false}));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());


//mongoose
const db_string = process.env.DB_STRING
// @ts-ignore
mongoose.connect(db_string, {useNewUrlParser: true, useUnifiedTopology : true})
.then(() => app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT} and connected to DB!`)))
.catch((err)=> {logger.error(err)});                                                                                

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
// app.use(express.static('../frontend/static'));
// Trying to server via nginx
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'combined.log' }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}} Response time:{{res.responseTime}}ms", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).

}));
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'combined.log' }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));



// Routers
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/cr', require('./routes/cr'));
app.use('/valorant', require('./routes/valorant'));
app.use('/overwatch', require('./routes/ow'));
app.use('/minecraft', require('./routes/minecraft'))
