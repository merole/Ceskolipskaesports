// @ts-check

const { Server, Socket } = require("socket.io");
const { Pool } = require("pg");
const express = require("express");
const mongoose = require('mongoose'); 
var crypto = require('crypto');
const { db } = require("./models/user");
require('dotenv').config();
const passport = require('passport')

//app init
const app = express();
app.use(express.urlencoded({extended : false}));
app.set("view engine", "ejs");
const http = require("http").Server(app);
const io =  require("socket.io")(http);    
//mongoose
let cluster_pass = process.env.CLUSTER_PASS;
let cluster_uname = process.env.CLUSTER_NAME;
let db_name1 = process.env.DB_NAME1
const URI = "mongodb+srv://" + cluster_uname + ":" + cluster_pass + "@cr-user.9uma6.mongodb.net/" + db_name1 + "?retryWrites=true&w=majority";
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology : true})
.then(() => http.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT} and connected to DB!`)))
.catch((err)=> console.log(err));                                                                                

// Routers
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/index'));

// Passport setup for login and cookies
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static("static"));
