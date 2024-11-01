const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: String,
    open: Number,
    high: Number,
    low: Number,
    price: Number,
    volume: Number,
});

module.exports = mongoose.model('Stock', stockSchema);