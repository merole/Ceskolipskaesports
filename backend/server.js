const { Server, Socket } = require("socket.io");
const { Pool } = require("pg");
const express = require("express");
const mongoose = require('mongoose'); 
var crypto = require('crypto'); 
require('dotenv').config();

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);                                                                                              


const port = 90;

io.on('connection', function(socket) {
    console.log("User connected");
    socket.on('Disconnect', () => {
        console.log("User disconnected");
    })


})



app.use(express.static("../frontend/src"));
app.get("/", (req, res) => res.sendFile("index.html"));
http.listen(port, () => console.log(`Example app listening on port ${port}!`));
