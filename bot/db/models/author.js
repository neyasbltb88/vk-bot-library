const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const author = new Schema({
    vkId: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    registerDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastNoteDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = model('Author', author);
