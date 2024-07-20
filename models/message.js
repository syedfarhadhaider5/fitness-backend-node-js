const mongoose = require('mongoose');

// Define the schema for messages
const messageSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        enum: ['unseen', 'seen'],
        default: 'unseen'
    }
});

// Create a model based on the schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
