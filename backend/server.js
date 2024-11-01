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
mongoose.connect(dbURI)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Función para obtener datos de la API de Alpha Vantage
const cache = {};

async function getStockData(symbol) {
    // Verificar si los datos están en caché
    if (cache[symbol] && cache[symbol].timestamp > Date.now() - 86400000) { // 24 horas
        console.log('Datos de caché:', cache[symbol].data);
        return cache[symbol].data;
    }

    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: symbol,
                apikey: process.env.ALPHA_VANTAGE_API_KEY,
            },
        });

        console.log('Respuesta de la API:', response.data);

        if (response.data['Information']) {
            throw new Error('Límite de solicitudes alcanzado. Por favor, inténtelo más tarde.');
        }

        const stockData = response.data['Global Quote'];

        if (!stockData || !stockData['01. symbol']) {
            throw new Error('Datos no disponibles para el símbolo proporcionado.');
        }

        // Guardar en caché
        cache[symbol] = {
            data: stockData,
            timestamp: Date.now(),
        };

        const stock = new Stock({
            symbol: stockData['01. symbol'],
            open: parseFloat(stockData['02. open']),
            high: parseFloat(stockData['03. high']),
            low: parseFloat(stockData['04. low']),
            price: parseFloat(stockData['05. price']),
            volume: parseInt(stockData['06. volume']),
        });

        await stock.save();
        console.log('Datos guardados en MongoDB:', stock);
    } catch (error) {
        console.error('Error al obtener datos de la API:', error.message);
        throw error; // Relanza el error para que sea manejado en el endpoint
    }
}




// Ruta para consultar y guardar datos de un stock específico
app.post('/api/stocks', async (req, res) => {
    const { symbol } = req.body;
    try {
        await getStockData(symbol);
        res.send(`Datos de ${symbol} guardados.`);
    } catch (error) {
        res.status(400).json({ message: error.message }); // Devuelve un error 400 con el mensaje
    }
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
