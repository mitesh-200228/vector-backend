const mongoose = require('mongoose');

const Users = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    profile_pic:{
        type: String,
        required: false,
    },
    linkedin_url: {
        type: String,
        required: true,
    },
    keywords: {
        type: Array,
        required: true,
    },
    about:{
        type: String,
        required: false,
    },
    room_id: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Users', Users);