const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    discord: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
        default: "unchecked"
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    matches: {
        type: Array,
        required: true,
        default: new Array()
    },
    times: {
        type: Array,
        required: true,
        default: new Array()
    },
    admin: {
        type: String,
    },
}, {timestamps: true });

const Player = mongoose.model('Player', PlayerSchema);

module.exports = Player;