// src/api.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://testingstocks-production.up.railway.app:5000/api', // Cambia esto si despliegas en otro servidor
    headers: {
        'Content-Type': 'application/json',
    },
});

export default {
    getStocks() {
        return apiClient.get('/stocks');
    },
    addStock(symbol) {
        return apiClient.post('/stocks', { symbol });
    },
};
