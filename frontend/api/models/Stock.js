// api/models/stock.js
const mongoose = require('mongoose');

// Definición del esquema para los stocks
const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true, // Asegúrate de que los símbolos sean únicos
    },
    open: {
        type: Number,
        required: true,
    },
    high: {
        type: Number,
        required: true,
    },
    low: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    volume: {
        type: Number,
        required: true,
    },
});

// Exportar el modelo de Stock
module.exports = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
