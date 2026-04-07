require('dotenv').config();

const CMC_API_KEY = process.env.CMC_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// API Endpoints
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
const CRYPTOCOMPARE_BASE_URL = 'https://min-api.cryptocompare.com/data/histoday';

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Telegram bot is running...');

/**
 * Fetches cryptocurrency price details using CoinMarketCap API.
 * @param {string[]} symbols - Array of cryptocurrency symbols (e.g., ['BTC', 'ETH']).
 * @returns {string} - Formatted string containing price details.
 */
async function getCryptoPrice(symbols) {
  try {
    if (!Array.isArray(symbols)) {
      symbols = [symbols];
    }
    const response = await axios.get(CMC_BASE_URL, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
      params: {
        symbol: symbols.join(','),
        convert: 'USD',
      },
    });

    let result = '';
    symbols.forEach(symbol => {
      const data = response.data.data[symbol];
      if (data) {
        const quote = data.quote.USD;
        result += `\n----\u{1F4B0}${symbol} \u{1F4B0}Price Details ----`;
        result += `\n\u{2B50}Rank: #${data.cmc_rank}`;
        result += `\n\u{2B50}Price: $${quote.price.toFixed(2)}`;
        result += `\n\u{2B50}1h Change: ${quote.percent_change_1h ? quote.percent_change_1h.toFixed(2) + '%' : 'N/A'}`;
        result += `\n\u{2B50}24h Change: ${quote.percent_change_24h.toFixed(2)}%`;
        result += `\n\u{2B50}7d Change: ${quote.percent_change_7d.toFixed(2)}%`;
        result += `\n\u{2B50}30d Change: ${quote.percent_change_30d.toFixed(2)}%`;
        result += `\n\u{2B50}24h Volume: $${(quote.volume_24h / 1_000_000).toFixed(2)}M`;
        result += `\n\u{2B50}Market Cap: $${(quote.market_cap / 1_000_000).toFixed(2)}M`;
        result += `\n\u{2B50}Circulating Supply: ${(data.circulating_supply / 1_000_000).toFixed(2)}M`;
        result += `\n\u{2B50}Total Supply: ${(data.total_supply / 1_000_000).toFixed(2)}M`;
        result += `\n\u{2B50}Max Supply: ${data.max_supply ? (data.max_supply / 1_000_000).toFixed(2) + 'M' : 'N/A'}`;
      } else {
        result += `\nNo data found for ${symbol}`;
      }
    });
    return result;
  } catch (error) {
    throw new Error(`Error fetching price: ${error.message}`);
  }
}



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


/**
 * Handle /price command
 */
bot.onText(/\/price (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const symbols = match[1].split(',').map(symbol => symbol.trim().toUpperCase());

  try {
    const result = await getCryptoPrice(symbols);
    bot.sendMessage(chatId, result || 'No data available.');
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
});



/**
 * Handle /history command
 */
bot.onText(/\/history (\w+) (\d{4}-\d{2}-\d{2})/, async (msg, match) => {
  const chatId = msg.chat.id;
  const symbol = match[1].toUpperCase();
  const dateStr = match[2];
  const date = new Date(dateStr);
  const timestamp = Math.floor(date.getTime() / 1000);

  if (isNaN(timestamp)) {
    bot.sendMessage(chatId, 'Invalid date format. Use YYYY-MM-DD.');
    return;
  }

  try {
    const result = await getHistoricalData(symbol, timestamp);
    bot.sendMessage(chatId, result || 'No data available.');
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
});
