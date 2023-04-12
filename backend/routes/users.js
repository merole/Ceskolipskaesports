// @ts-check
// Packages
const User = require('../models/user');
const Token = require('../models/password_token');
const crypto = require('crypto');
const url = require("url");
const router = require("express")();
const passport = require('passport');
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);
const logger = require('../modules/logger');
const createTransporter = require('../modules/transporter')

router.set('views', '../frontend/views/users');

require('dotenv').config();
//------

// Setup for transporter for sending confim emails
router.post('/login', 
  passport.authenticate("user", { 
    failureRedirect: "/login",
    failureFlash: true}),
    (req, res, next) => {
      let params = url.parse(req.url,true).query;
      if (params.redirect == "register") {
        res.redirect("/cr/register");
      } else {
        res.redirect("/");
      }
    }
);

router.post("/register", async (req, res, next) => {
    const {name, email, password, password2} = req.body;
    let salt = crypto.randomBytes(32).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 10000, 64, process.env.PASS_HASH).toString("hex");
    // Creating a unique salt for a particular user 
    const user = new User(
        {
            name: name,
            email: email,
            password: hash,
            salt: salt,
            active: false
        }
    );

    let errors = [];
    // Sends a message, type gets put into the class param, message is the text
    if(!name || !email || !password || !password2) {
      errors.push("Vyplňte všechna pole")
    }
    await User.find({ name: name })
    .then((result) => {
      if (result.length > 0) {
        errors.push("Jméno se již používá");
      }
    });
    await User.find({ email: email })
    .then((result) => {
      if (result.length > 0) {
        errors.push("E-mailová adresa se již používá");
      }
    });
    if (password !== password2) {
      errors.push("Hesla se neshodují");
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push("Neplatná e-mailová adresa");
    }

    if (errors.length > 0) {
      res.render('register', {
        messages : errors,
        name : name,
        email : email,
        password : password,
        password2 : password2});
    }
    else {
      let id;
      let mail_options;

      logger.log(`${user.name} CREATED an account`);
      user.save()
      .then(res.redirect("/login"))
      .then(User.find( { name: name }))
      .then((result) => {
        let i = result;
        id = i._id;
        mail_options = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Potvrďte svůj účet',
          text: "Potvrďte zde: " + process.env.URL + "users/confirm/?id=" + id
        }

        // Use only with transporter
        const sendEmail = async (emailOptions) => {
          let emailTransporter = await createTransporter();
          await emailTransporter.sendMail(emailOptions, (err) => {if(err) {logger.error(err);}});
        };
        sendEmail(mail_options);
        }
      );
      
    }
});

router.get("/confirm", (req, res, next) => {
  let params = url.parse(req.url,true).query;
  User.findById(params.id).
  then((result) => {
    logger.log(`${req.user.name} CREATED and account`)
  })
  User.findByIdAndUpdate(params.id, { $set: {active: true}}, (err) => {err});
  res.render("login", {messages: ["Účet potvrzen"], type: "primary"});
});

router.post('/logout',(req, res, next)=>{
  // @ts-ignore
  req.logout(function(err) {
      if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post("/send-email", (req, res, next) => {
  res.render("send_again");
});

router.post("/send_again", (req, res, next) => {
  let {email} = req.body;
  
  User.findOne( {email: email})
   .then( (result) => {
     if (!result.active) {
        let id = result._id;
        let mail_options = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Potvrďte svůj účet',
          text: "Potvrďte zde: " + process.env.URL + "users/confirm/?id=" + id
        };
      
        // Use only with transporter
        const sendEmail = async (emailOptions) => {
          let emailTransporter = await createTransporter();
          await emailTransporter.sendMail(emailOptions, (err) => {if(err) {logger.error(err);}});
        };
        sendEmail(mail_options);
        res.render("login", {messages: null });
      } else {
        logger.log(`${email} tried to resend mail with an active account`)
        res.send("no");
      }
    });
});

router.get("/reset-password", (req, res, next) => {
  res.render("reset_password");
});

router.post("/reset-password", (req, res, next) => {
  let {email} = req.body;

  User.findOne({email: email})
  .then((result) => {
    if (result) {
      let token = new Token({
        email: email,
        token: crypto.randomBytes(12).toString("hex")
      });
      token.save();
      let mail_options = {
        from: process.env.EMAIL,
        to: email,
        subject: "Obnovení hesla",
        html: `Obnovte si heslo zde: ${process.env.URL}users/reset_password/?token=${token.token} <br> Tento odkaz vyprší za 15 minut`
      };
      const sendEmail = async (emailOptions) => {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail(emailOptions, (err) => {if(err) {logger.error(err);}});
      };
      sendEmail(mail_options);
      res.render("login", {messages: ["Odkaz odeslán na e-mail"], type: "primary"});
    }
  });
});

router.get("/reset_password", (req, res, next) => {
  let params = url.parse(req.url,true).query;
  Token.findOne({token: params.token})
  .then((result) => {
    if (result != null) {
      let _15MIN_IN_MS = 900000;
      let now = new Date();
      if (result && result.createdAt.getTime() + _15MIN_IN_MS >= now.getTime()) {
        res.render("set_password", {email: result.email, token: result.token, message: null});
      } else {
        res.render("../partials/error", {message: "Odkaz vypršel", type: "alert"});
      }
    } else {
      res.render("../partials/error", {message: "Neplatný odkaz", type: "alert"});
    }
  });
});

router.post("/reset_password", (req, res, next) => {
  let {token, email, new_password, new_password_again} = req.body;
  Token.findOne({token: token, email: email})
  .then((result) => {
      if (new_password == new_password_again) {
        User.findOne({email: email})
        .then((result) => {
          let password = crypto.pbkdf2Sync(new_password, result.salt, 10000, 64, process.env.PASS_HASH).toString("hex");
          User.findOneAndUpdate({email: email}, {$set: {password: password}}, ((err)=>{if(err){logger.error(err);}}));
          res.render("login", {messages: ["Heslo změněno úspěšně"], type: "primary"})
        })
      } else {
        res.render("set_password", {email: result.email, token: result.token, message: "Hesla se musí shodovat", type: "alert"});
      }
    }
  );
});


module.exports = router;