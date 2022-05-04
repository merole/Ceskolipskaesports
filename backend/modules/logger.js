// get the Console class
const { Console } = require("console");
const fs = require("fs");

// make a new logger
const myLogger = new Console({
  stdout: fs.createWriteStream("../events.log"), // a write stream,
  stderr: fs.createWriteStream("../errors.log"), // a write stream
});

module.exports = myLogger;