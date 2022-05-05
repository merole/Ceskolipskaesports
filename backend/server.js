const { Server, Socket } = require("socket.io");
const express = require("express");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);


const port = 80;



app.use(express.static("../frontend/src"));
app.get("/", (req, res) => res.sendFile("index.html"));
http.listen(port, () => console.log(`Example app listening on port ${port}!`));
