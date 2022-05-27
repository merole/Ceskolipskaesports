// @ts-check
// Packages
const router = require("express")();
const Match = require('../models/match');
const Player = require('../models/player');
// @ts-ignore
// @ts-ignore
const User = require('../models/user');
const createTransporter = require('../modules/transporter');
const logger = require('../modules/logger.js');

router.set("views", "../frontend/views/admin");

require('dotenv').config();
//-------
let today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

const checkAuth = (req) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return true;
    } else { 
        return false;
    }
}

router.get("/", (req, res, next) => {
    // @ts-ignore
    if (checkAuth(req)) {
        Match.find({})
        .then( (result) => {
            result.sort((a, b) => {
                if (a.result == "unfinished" && b.result != "unfinished") {
                    return -1;
                } else if (b.result == "unfinished" && a.result != "unfinished") {
                    return 1;
                } else {
                    return 0;
                }
            });
            // @ts-ignore
            res.render("admin", { matches: result, admin: req.user});
        });
        
    } else {
        // @ts-ignore
        logger.log(`${req.user.name} FAILED TO ACCESS the admin page TIME: ${date}`);
        res.redirect("/login");
    }
});

router.post("/add-match", (req, res, next) => {
    if (checkAuth(req)) {
        let {player1, player2, maxDate} = req.body;
        User.findOne({name: player1})
        .then((result1) => {
            User.findOne({name: player2})
            .then((result2) => {
                const match = new Match(
                    {
                        player1: player1,
                        player2: player2,
                        discord1: result1.discord,
                        discord2: result2.discord,
                        maxDate: maxDate
                    });
                // @ts-ignore
                logger.log(`${req.user.name}$ ADDED match ${player1} vs ${player2} TIME: ${date}`)
                match.save();
                res.redirect("/admin");
            });
        });


    } else {
        // @ts-ignore
        logger.log(`${req.user.name} FAILED TO ACCESS the admin page TIME: ${date}`);
        res.redirect("/login");
    }
});

// @ts-ignore
// @ts-ignore
router.post("/add-matches", (req, res, next) => {
    if (checkAuth(req)) {
        // TODO ukoncit registraci, vygenerovat skupiny, vygenerovat zapasy, 
        // @ts-ignore
        // @ts-ignore
        let {match_str} = req.body;
    } else {
        // @ts-ignore
        logger.log(`${req.user.name} FAILED TO ACCESS the admin page TIME: ${date}`);
        res.redirect("/login");
    }
})

// @ts-ignore
// @ts-ignore
router.post("/result", (req, res, next) => {
    if (checkAuth(req)) {
        let {adminComment, win_1, win_2, id, update_comment} = req.body;
        if (update_comment) {
            Match.findByIdAndUpdate(id, {$set: {adminComment: adminComment} }, (err) => {if(err){logger.error(err);}});
        } else {
            // @ts-ignore
            Match.findByIdAndUpdate(id, {$set: {adminComment: adminComment, result: win_1 ? win_1 : win_2, admin: req.user.name}}, (err) => {if(err){logger.error(err);}});
        }
        res.redirect("/admin")
    } else {
        // @ts-ignore
        logger.log(`${req.user.name} FAILED TO ACCESS the admin page TIME: ${date}`);
        res.redirect("/login");
    }
});

// @ts-ignore
// @ts-ignore
router.get("/accept-cr", (req, res, next) => {
    if (checkAuth(req)) {
        Player.find({comment: "unchecked"})
        .then((result) => {
            // @ts-ignore
            res.render("accept_cr", {players: result, admin: req.user});
         });
    } else {
        // @ts-ignore
        logger.log(`${req.user.name} FAILED TO ACCESS the admin page TIME: ${date}`);
        res.redirect("/login");
    }
});

// @ts-ignore
// @ts-ignore
router.post("/accept-cr", async (req, res, next) => {
    if (checkAuth(req)) {
        let {name, comment, update_comment, accept, deny} = req.body;
        if (update_comment) {
            Player.findOneAndUpdate({name: name}, {$set: {comment: comment}}, (err) => {if(err){logger.error(err);}});
        } else if (accept) {
            // @ts-ignore
            Player.findOneAndUpdate({name: name}, {$set: {active: true, comment: comment, admin: req.user.name}}, (err) => {if(err){logger.error(err);}});
            Player.findOne({name: name})
            .then(async (result) => {
                let mail_options = {
                    from: process.env.EMAIL,
                    to: result.email,
                    subject: 'Českolipská Esports: Clash Royale',
                    text: "Byl jsi přijat do Českolipská Esports turnaje v Clash Royale. Sleduj e-mail, discord a stránku svého účtu pro info"
                }
                let emailTransporter = await createTransporter();
                await emailTransporter.sendMail(mail_options, (err) => {if(err) {logger.error(err);}});
                // @ts-ignore
                logger.log(`${req.user.name} ACCEPTED ${name}`);
            });

        } else if (deny) {
            Player.findOneAndDelete({name: name}, (err) => {if(err){logger.error(err);}});
            logger.log(`${req.user.name} DENIED ${name}`);
        }
        res.redirect("/admin/accept-cr");
    } else {
        // @ts-ignore
        logger.log(`${req.user.name} FAILED TO ACCESS the admin page TIME: ${date}`);
        res.redirect("/login");
    }
});
module.exports = router;