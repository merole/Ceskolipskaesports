// @ts-check
// Packages
const Match = require('../models/match');
const Player = require('../models/player');
const router = require("express")();
const passport = require('passport');
const multer = require("multer");
const fs = require("fs");
const logger = require('../modules/logger.js');
// This is proably required
const LocalStrategy = require('passport-local').Strategy;
require('../modules/init')(passport);

router.set('views', '../frontend/views/cr');

require('dotenv').config();
//------

const upload = multer({ dest: 'uploads/' });
router.post("/upload", (req, res, next) => {
    if (req.isAuthenticated()) {
        upload.single("img")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                logger.error("Multer err:" + err)
            } else if (err) {
                logger.error(err);
            } else {
                let img = {
                    contentType: req.file.mimetype,
                    data: Buffer.from(fs.readFileSync(req.file.path).toString("base64"),'base64')
                };

                let { comment, user, id, win} = req.body;
                Match.findById(id)
                .then((result) => {
                    if (result.player1 == user) {
                        result.update({img1: img, comment1: win ? "WON" + comment : "LOST" + comment}, (err) => {if (err) {logger.error(err)}});
                        res.redirect("/user");
                    } else if (result.player2 == user) {
                        result.update({img2: img, comment2: win ? "WON" + comment : "LOST" + comment}, (err) => {if (err) {logger.error(err)}});
                        res.redirect("/user");
                    } else {
                        return
                    }
                });
            }
        });   
    } else {
        res.redirect("login");
    }
});

router.get("/confirm", (req, res, next) => {
    res.render("confirm", {user: req.user})
})

router.get("/rules", (req, res, next) => {
    res.render("rules", {user: req.user});
});

router.get("/register", (req, res, next) => {
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

// This registers a user to the cr tournament
router.post("/register", (req, res, next) => {
    let {link, checkbox, times} = req.body;
    let errors = [];
    Player.find({name: req.user.name})
    .then((result) => {
        if (result.length > 0) {
            errors.push("Přihláška již byla odeslána");
        }
    });
    if (!/^https:\/\/link.clashroyale.com\/invite\/friend\/[a-z][a-z]\?tag=[\s\S]*&token=[\s\S]*&platform=[\s\S]*$/.test(link)) {
        errors.push("Neplatný link");
    }
    if (!checkbox) {
        errors.push("Seznamte se s pravidly!");
    }
    if (!req.user.discord) {
        errors.push("Nastavte si v <a class='link' href='/user/settings'> profilu</a> Váš Discord tag");
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
                discord: req.user.discord,
                // TOD send email after allow or deny by admin
                // @ts-ignore
                email: req.user.email
            }
        );
        player.save()
        .then(res.redirect("/cr/confirm"));
    }
});

module.exports = router;