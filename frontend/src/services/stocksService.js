// src/services/stocksService.js
import api from '../api'; // Ajusta la ruta si es necesario

export const useStocks = {
  async fetchStock(symbol, stocks, setMessage) {
    try {
      const response = await api.addStock(symbol);
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Agrega el nuevo stock a la lista
      const newStock = {
        symbol: symbol,
        price: response.data.price, // Asegúrate de que el API devuelve el precio
        time: currentTime,
      };

      stocks.push(newStock); // Agregar el nuevo stock aquí
      console.log("Nuevo stock agregado:", newStock); // Debugging

      setMessage(`Acción ${symbol} consultada con éxito`, 'success');
      return true; // Indica que la operación fue exitosa
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message, 'error');
      } else {
        setMessage('Error al obtener los datos de la acción.', 'error');
      }
      return false; // Indica que hubo un error
    }
  },

  async getStocks(setStocks, setMessage) {
    try {
      const response = await api.getStocks();
      setStocks(response.data);
    } catch (error) {
      setMessage('Error al obtener los datos guardados.', 'error');
    }
  },
};
