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
    if (checkAuth) {
        Match.find( {} , (err) => {if (err) {console.log(err);}})
        .then( (result) => {
            res.render("admin", { matches: result});
        });
        
    } else {
        res.render("home");
    }
})

// TODO log unsuccesful ip
router.post("/add-match", (req, res) => {
    if (checkAuth) {
        let {player1, player2, maxDate} = req.body;
        const match = new Match(
            {
                player1: player1,
                player2: player2,
                maxDate: maxDate
            }
        );

        match.save()
        res.render("admin")
    } else {
        res.render("home");
    }
})
module.exports = router;