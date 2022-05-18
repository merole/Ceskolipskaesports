const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    player1: {
        type: String,
        required: true
    },
    player2: {
        type: String,
        required: true
    },
    maxDate: {
        type: String,
        required: true
    },
    img1: {
        data: Buffer,
        contentType: String
    },
    img2: {
        data: Buffer,
        contentType: String
    },
    comment1: {
        type: String
    },
    comment2: {
        type: String
    },
    adminComment: {
        type: String
    },
    result: {
        type: String,
        required: true,
        default: "unfinished"
    }
}, {timestamps: true });

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;