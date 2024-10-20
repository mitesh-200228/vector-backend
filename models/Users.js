const mongoose = require('mongoose');

const Users = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
        required: true,
    },
    room_id: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Users', Users);