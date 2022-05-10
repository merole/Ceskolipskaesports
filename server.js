const { Server, Socket } = require("socket.io");
const { Pool } = require("pg");
const express = require("express");
const mongoose = require('mongoose'); 
var crypto = require('crypto');
require('dotenv').config();
const port = 90;

//app init
const app = express();
app.use(express.urlencoded({extended : false}));
app.set("view engine", "ejs");
const http = require("http").Server(app);
const io = require("socket.io")(http);    
//mongoose
let pass = process.env.DB_PASS;
const URI = "mongodb+srv://merole:" + pass + "@cr-user.9uma6.mongodb.net/CR?retryWrites=true&w=majority";
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology : true})
.then(() => http.listen(port, () => console.log(`Example app listening on port ${port} and connected to DB!`)))
.catch((err)=> console.log("server.js"));                                                                                      

// Routers
app.use('/users', require('./routes/users'));

app.use(express.static(__dirname + "/static"));
app.get("/", (req, res) => res.render("index"));
