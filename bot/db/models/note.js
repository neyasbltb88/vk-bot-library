const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const note = new Schema(
    {
        _id: Number,
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        body: {
            type: String
        },
        attachments: {
            type: Array
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'Author',
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    { _id: false }
);

note.plugin(AutoIncrement);

module.exports = model('Note', note);
