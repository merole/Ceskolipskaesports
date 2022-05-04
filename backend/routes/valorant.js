// @ts-check
// Packages
const router = require("express")();
const logger = require('../modules/logger.js');
const url = require("url");
const fs = require('fs');
const path = require('path');

router.set('views', '../frontend/views/valorant');

require('dotenv').config();
//-------

router.get("/archive_2022", (req, res, next) => {

    const directoryPath = "../frontend/static/images/val-ceny"
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            res.send(err);
            return console.log('Unable to scan directory: ' + err);
            
        } 
        res.render("archive_2022", {user: req.user, files: files});
    });
    
});

module.exports = router;