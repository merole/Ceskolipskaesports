// @ts-check
// Packages
const express = require('express');
const router = require("express")();
const passport = require('passport');
const User = require('../models/user');
const Match = require('../models/match');

router.set("views", "../frontend/views/admin");

require('dotenv').config();
//-------
// TODO logging for EVERYTHING
const checkAuth = (req) => {
    if (req.user.role === "admin") {
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

router.post("/result", (req, res) => {
    if (checkAuth(req)) {
        let {admin_comment, win_1, win_2, id} = req.body;
        Match.findByIdAndUpdate(id, {$set: {admin_comment: admin_comment, result: win_1 ? win_1 : win_2}}, (err) => {if (err){console.log(err);}});
        res.redirect("/admin")
    } else {
        res.redirect("/login");
    }
});

module.exports = router;