require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Stock = require('../models/Stock'); // Ajusta la ruta según tu estructura de carpetas
const cors = require('cors'); // Importa el paquete cors

// Conexión a la base de datos
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.orsoe1x.mongodb.net/stockAPI';
mongoose.connect(dbURI)
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

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

// Exportar funciones para manejar las solicitudes HTTP
module.exports = async (req, res) => {
    // Configura CORS para permitir solicitudes desde un origen específico
    res.setHeader('Access-Control-Allow-Origin', '*'); // Cambia '*' por tu dominio específico si lo deseas
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Si la solicitud es OPTIONS, simplemente responde con un 200
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { symbol } = req.body;
        try {
            await getStockData(symbol);
            res.status(200).send(`Datos de ${symbol} guardados.`);
        } catch (error) {
            res.status(400).json({ message: error.message }); // Devuelve un error 400 con el mensaje
        }
    } else if (req.method === 'GET') {
        try {
            const stocks = await Stock.find();
            res.status(200).json(stocks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Método ${req.method} no permitido`); // Manejo de método no permitido
    }
};
