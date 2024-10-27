require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const Stock = require('./models/Stock');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const dbURI = 'mongodb+srv://admin:admin@cluster0.orsoe1x.mongodb.net/stockAPI'; // Cambia esto a tu base de datos
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Función para obtener datos de la API de Alpha Vantage
async function getStockData(symbol) {
    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: symbol,
                apikey: process.env.ALPHA_VANTAGE_API_KEY,
            },
        });

        const stockData = response.data['Global Quote'];
        const stock = new Stock({
            symbol: stockData['01. symbol'],
            open: parseFloat(stockData['02. open']),
            high: parseFloat(stockData['03. high']),
            low: parseFloat(stockData['04. low']),
            price: parseFloat(stockData['05. price']),
            volume: parseInt(stockData['06. volume']),
            latest_trading_day: stockData['07. latest trading day'],
            previous_close: parseFloat(stockData['08. previous close']),
            change: parseFloat(stockData['09. change']),
            change_percent: stockData['10. change percent'],
        });

        await stock.save();
        console.log('Datos guardados en MongoDB:', stock);
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
}

// Ruta para consultar y guardar datos de un stock específico
app.post('/api/stocks', async (req, res) => {
    const { symbol } = req.body;
    await getStockData(symbol);
    res.send(`Datos de ${symbol} guardados.`);
});

// Ruta para obtener todos los stocks almacenados
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
