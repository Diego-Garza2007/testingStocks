<template>
    <div>
      <h1>Consulta de Mercado de Valores</h1>
      <input v-model="symbol" placeholder="Ingresa el símbolo de la acción" />
      <button @click="fetchStock">Consultar</button>
      <div v-if="message">{{ message }}</div>
  
      <h2>Acciones Guardadas</h2>
      <ul>
        <li v-for="stock in stocks" :key="stock._id">
          <img :src="getCompanyLogo(stock.symbol)" alt="Logo de la empresa" class="company-logo" />
          {{ stock.symbol }} - Precio: {{ stock.price }} USD
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import api from '../api';
  import { getCompanyLogo } from '../utils';
  
  export default {
    data() {
      return {
        symbol: '',
        stocks: [],
        message: ''
      };
    },
    methods: {
      async fetchStock() {
        try {
          const response = await api.addStock(this.symbol);
          this.message = response.data;
          this.symbol = '';
          this.getStocks(); // Refresca la lista
        } catch (error) {
          this.message = 'Error al obtener los datos de la acción.';
        }
      },
      async getStocks() {
        try {
          const response = await api.getStocks();
          this.stocks = response.data;
        } catch (error) {
          this.message = 'Error al obtener los datos guardados.';
        }
      },
      getCompanyLogo,
    },
    mounted() {
      this.getStocks();
    },
  };
  </script>
  
  <style scoped>
  .company-logo {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }
  </style>
  