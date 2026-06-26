import axios from 'axios';

const BASE_URL = 'https://api.frankfurter.app';

export const getExchangeRate = async (fromCurrency, toCurrency, date = 'latest') => {
  if (fromCurrency === toCurrency) return 1;
  
  try {
    
    const endpoint = date === 'latest' ? '/latest' : `/${date.split('T')[0]}`;
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        from: fromCurrency,
        to: toCurrency
      }
    });

    if (response.data && response.data.rates && response.data.rates[toCurrency]) {
      return response.data.rates[toCurrency];
    }

    return null;
  } catch (error) {
    console.error('Currency API Error:', error.message);
    return null;
  }
};
