const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: String,
    open: Number,
    high: Number,
    low: Number,
    price: Number,
    volume: Number,
    latest_trading_day: String,
    previous_close: Number,
    change: Number,
    change_percent: String,
});

module.exports = mongoose.model('Stock', stockSchema);