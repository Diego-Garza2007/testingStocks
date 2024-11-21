<script>
import { useStocks } from '../services/stocksService'; // Ajusta la ruta según sea necesario
import { getCompanyLogo } from '../utils';

export default {
  data() {
    return {
      symbol: '',
      stocks: [],
      message: '',
      showMessage: false,
      messageType: '',
    };
  },
  methods: {
    async fetchStock() {
      const success = await useStocks.fetchStock(this.symbol, this.stocks, this.setMessage);
      if (success) {
        this.symbol = '';
      }
    },
    async getStocks() {
      await useStocks.getStocks((data) => {
        this.stocks = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }, this.setMessage);
    },
    validateInput() {
      this.symbol = this.symbol.toUpperCase();
    },
    getCompanyLogo,
    setMessage(message, type) {
      this.message = message;
      this.messageType = type;
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
      }, 5000);
    },
  },
  mounted() {
    this.getStocks();
  },
};
</script>


<template>
    <div class="Stocks__container">
      <h1 class="Stocks__title">Consulta de Mercado de Valores</h1>
      <input class="Stocks__mainInput" v-model="symbol" placeholder="Ingresa el símbolo de la acción" maxlength="10" @input="validateInput"/>
      <button class="Stocks__btn" @click="fetchStock">Consultar</button>
      <div v-if="showMessage" :class="['Stocks__div', messageType]">{{ message }}</div>
  
      <h2>Acciones Guardadas</h2>
      <ul>
        <li v-for="stock in stocks" :key="stock._id">
          <img :src="getCompanyLogo(stock.symbol)" alt="Logo de la empresa" class="company-logo" />

          {{ stock.symbol }} - Precio: {{ stock.price }} USD - Consultado a las: {{ stock.time }}
        </li>
      </ul>
    </div>
  </template>
  

  
  <style scoped>
  .company-logo {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }
  </style>
  