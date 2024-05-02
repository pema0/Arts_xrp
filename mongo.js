const mongoose = require('mongoose');

const artSchema = new mongoose.Schema({
    xrpWalletAddress: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const Art = mongoose.model('Art', artSchema);

module.exports = Art;
