const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
}, {timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;