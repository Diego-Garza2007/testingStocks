export function getCompanyLogo(symbol) {
    const symbolToDomain = {
      AMZN: 'amazon.com',
      AAPL: 'apple.com',
      MSFT: 'microsoft.com',
      GOOGL: 'google.com',
      TSLA: 'tesla.com',
      IBM: 'ibm.com'
      // Otros símbolos y dominios aquí
    };
    const domain = symbolToDomain[symbol] || 'defaultdomain.com';
    return `https://logo.clearbit.com/${domain}`;
  }