require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const Stock = require('./models/Stock');

const app = express();
const PORT = process.env.PORT || 8080; // Ajustamos el puerto aquí


app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const dbURI = 'mongodb+srv://admin:admin@cluster0.orsoe1x.mongodb.net/stockAPI';
mongoose.connect(dbURI, {
    useNewUrlParser: true, // Analizador de URI más robusto
    useUnifiedTopology: true, // Activa el nuevo motor de monitoreo
})
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Cache para almacenar datos de acciones
const cache = {};

// Función para obtener datos de la API de Alpha Vantage
async function getStockData(symbol) {
    const cacheKey = symbol.toUpperCase(); // Normaliza el símbolo a mayúsculas
    const cacheDuration = 86400000; // 1 día en milisegundos

    // Verificar si los datos están en caché y son recientes
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < cacheDuration)) {
        console.log('Datos de caché:', cache[cacheKey].data);
        return cache[cacheKey].data;
    }

    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: cacheKey,
                apikey: process.env.ALPHA_VANTAGE_API_KEY,
            },
        });

        const stockData = response.data['Global Quote'];
        if (!stockData) throw new Error('No se encontraron datos de acciones');

        // Guardar en caché
        cache[cacheKey] = {
            data: stockData,
            timestamp: Date.now(),
        };

        // Crear y guardar el stock en MongoDB
        const stock = new Stock({
            symbol: stockData['01. symbol'],
            open: parseFloat(stockData['02. open']),
            high: parseFloat(stockData['03. high']),
            low: parseFloat(stockData['04. low']),
            price: parseFloat(stockData['05. price']),
            volume: parseInt(stockData['06. volume']),
            timestamp: new Date(),
        });

        await stock.save();
        console.log('Datos guardados en MongoDB:', stock);

        return {
            symbol: stock.symbol,
            price: stock.price,
            timestamp: stock.timestamp,
        };
    } catch (error) {
        console.error('Error al obtener datos de la API:', error.message);
        throw error;
    }
}

// Ruta para consultar y guardar datos de un stock específico
app.post('/api/stocks', async (req, res) => {
    const { symbol } = req.body;
    try {
        const stockData = await getStockData(symbol);
        console.log("Datos enviados al frontend:", stockData);
        res.json(stockData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para obtener todos los stocks almacenados
app.get('/api/stocks', async (req, res) => {
    try {
        // Ordenamos los stocks por timestamp en orden descendente (más recientes primero)
        const stocks = await Stock.find().sort({ timestamp: -1 });  // -1 indica orden descendente
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
