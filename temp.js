const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Replace with your actual API keys
const CMC_API_KEY = 'c35750c6-0ce6-4d7a-829c-4a1ecc64f382'; // CoinMarketCap API Key
const TELEGRAM_BOT_TOKEN = '7899469963:AAF2U0QepeQfYwuUBElphlHvj1EAoQLNY8E'; // Telegram Bot Token

// API Endpoints
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
const CRYPTOCOMPARE_BASE_URL = 'https://min-api.cryptocompare.com/data/histoday';

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Telegram bot is running...');





/**
 * Fetches historical market cap, circulating supply, and price for a specific date using CryptoCompare API.
 * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC').
 * @param {number} timestamp - Unix timestamp for the specific date.
 * @returns {string} - Formatted string containing historical data.
 */
async function getHistoricalData(symbol, timestamp) {
    try {
      const response = await axios.get(CRYPTOCOMPARE_BASE_URL, {
        params: {
          fsym: symbol.toUpperCase(),
          tsym: 'USD',
          limit: 1,
          toTs: timestamp,
        },
      });
  
      const data = response.data.Data;
      if (data && data.length > 0) {
        const entry = data[0];
        return (
          `\n---- \u{1F4B0}Historical Data for ${symbol} on ${new Date(timestamp * 1000).toISOString()} ----` +
          `\n\u{2B50}Price: $${entry.close.toFixed(2)}` +
          `\n\u{2B50}Market Cap: $${entry.volumeto ? (entry.volumeto / 1_000_000).toFixed(2) : 'N/A'}M` +
          `\n\u{2B50}Circulating Supply: ${(entry.volumeto ? (entry.volumeto / entry.close) / 1_000_000 : 'N/A').toFixed(2)}M`
        );
      } else {
        return `No historical data found for ${symbol} at timestamp ${timestamp}`;
      }
    } catch (error) {
      throw new Error(`Error fetching historical data: ${error.message}`);
    }
  }
  