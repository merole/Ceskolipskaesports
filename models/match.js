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
        type: String,
        required: true
    },
    img2: {
        type: String,
        required: true
    },
    comment1: {
        type: String,
        required: true
    },
    comment2: {
        type: String,
        required: true
    },
    adminComment: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: true
    }
}, {timestamps: true });

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;