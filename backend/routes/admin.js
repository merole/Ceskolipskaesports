// @ts-check
// Packages
const express = require('express');
const router = require("express")();
const passport = require('passport');
const User = require('../models/user');
const Match = require('../models/match');
const Player = require('../models/player');

router.set("views", "../frontend/views/admin");

require('dotenv').config();
//-------
// TODO logging for EVERYTHING
const checkAuth = (req) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return true;
    } else { 
        return false;
    }
}

// TODO log unsuccesful ip
router.get("/", (req, res) => {
    // @ts-ignore
    if (checkAuth(req)) {
        Match.find({})
        .then( (result) => {
            res.render("admin", { matches: result});
        });
        
    } else {
        res.redirect("/login");
    }
});

// TODO log unsuccesful ip
router.post("/add-match", (req, res) => {
    if (checkAuth(req)) {
        let {player1, player2, maxDate} = req.body;
        const match = new Match(
            {
                player1: player1,
                player2: player2,
                maxDate: maxDate
            }
        );

        match.save()
        res.redirect("/admin");
    } else {
        res.redirect("/login");
    }
});

router.post("/add-matches", (req, res) => {
    if (checkAuth(req)) {
        // TODO ukoncit registraci, vygenerovat skupiny, vygenerovat zapasy, 
        let {match_str} = req.body;
    } else {
        res.redirect("/login");
    }
})

router.post("/result", (req, res) => {
    if (checkAuth(req)) {
        let {adminComment, win_1, win_2, id, update_comment} = req.body;
        if (update_comment) {
            Match.findByIdAndUpdate(id, {$set: {adminComment: adminComment} }, (err) => {if(err){console.log(err);}});
        } else {
            Match.findByIdAndUpdate(id, {$set: {adminComment: adminComment, result: win_1 ? win_1 : win_2}}, (err) => {if(err){console.log(err);}});
        }
        res.redirect("/admin")
    } else {
        res.redirect("/login");
    }
});

router.get("/accept-cr", (req, res) => {
    if (checkAuth(req)) {
        Player.find({comment: "unchecked"})
        .then((result) => {
            res.render("accept_cr", {players: result, admin: req.user});
         });
    } else {
        res.redirect("/login");
    }
});

router.post("/accept-cr", (req, res) => {
    if (checkAuth(req)) {
        let {name, comment, update_comment, accept, deny} = req.body;
        console.log(req.body)
        if (update_comment) {
            Player.findOneAndUpdate({name: name}, {$set: {comment: comment}}, (err) => {if(err){console.log(err);}});
        } else if (accept) {
            Player.findOneAndUpdate({name: name}, {$set: {active: true, comment: comment}}, (err) => {if(err){console.log(err);}});
        } else if (deny) {
            Player.findOneAndDelete({name: name}, (err) => {if(err){console.log(err);}});
        }
        res.redirect("/admin/accept-cr");
    } else {
        res.redirect("/login");
    }
});
module.exports = router;