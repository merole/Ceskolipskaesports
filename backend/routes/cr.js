// @ts-check
// Packages
// TODO tidy up
const User = require('../models/user');
const Match = require('../models/match');
const Player = require('../models/player');
const flash = require('connect-flash');
const crypto = require('crypto');
const { google } = require("googleapis");
const nodemailer = require('nodemailer');
const url = require("url");
const router = require("express")();
const passport = require('passport');
const multer = require("multer");
const fs = require("fs");
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);

router.set('views', '../frontend/views/cr');

require('dotenv').config();
//------

const upload = multer({ dest: 'uploads/' });
router.post("/upload", (req, res) => {
    if (req.isAuthenticated()) {
        upload.single("img")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.log("Multer err:" + err)
            } else if (err) {
                console.log(err);
            } else {
                console.log(Object.keys(req))
                let img = {
                    contentType: req.file.mimetype,
                    data: Buffer.from(fs.readFileSync(req.file.path).toString("base64"),'base64')
                };

                let { comment, user, id, win} = req.body;
                Match.findById(id)
                .then((result) => {
                    if (result.player1 == user) {
                        result.update({img1: img, comment1: win ? "WON" + comment : "LOST" + comment}, (err) => {if (err) {console.log(err)}});
                        res.redirect("/user");
                    } else if (result.player2 == user) {
                        result.update({img2: img, comment2: win ? "WON" + comment : "LOST" + comment}, (err) => {if (err) {console.log(err)}});
                        res.redirect("/user");
                    } else {
                        // TODO logging
                        console.log("error");
                        return
                    }
                });
            }
        });   
    } else {
        res.redirect("login");
    }
});

// TODO msg potreba ucet pro registraci
router.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
        // @ts-ignore
        Player.exists({name: req.user.name})
        .then((result) => {
            if (result) {
                res.redirect("/user");
            }
            else {
                res.render("register", {user: req.user});
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/register", (req, res) => {
    let {link, checkbox, times} = req.body;
    let errors = [];
    if (!/^https:\/\/link.clashroyale.com\/invite\/friend\/[a-z][a-z]\?tag=[\s\S]*&token=[\s\S]*&platform=[\s\S]*$/.test(link)) {
        errors.push("Neplatný link");
    }
    if (!checkbox) {
        errors.push("Seznamte se s pravidly!");
    }

    if (errors.length > 0) {
        res.render("register", {user: req.user, messages: errors});
    } else {
        // TODO Times
        const player = new Player(
            {
                // @ts-ignore
                name: req.user.name,
                link: link,
                // @ts-ignore
                email: req.user.email
            }
        );
        player.save()
        .then(res.redirect("/cr/confirm"));
    }
});

module.exports = router;