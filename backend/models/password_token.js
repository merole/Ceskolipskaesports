const mongoose = require('mongoose');

// THis is used to store user data, display nemae, check authentication
const TokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
}, {timestamps: true });

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;