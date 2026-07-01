# Telegram Crypto Bot

A Telegram bot that provides real-time cryptocurrency price data and historical market information.

## Features

- **`/price <SYMBOLS>`** — Get current price details for one or more cryptocurrencies (e.g., `/price BTC,ETH,SOL`). Data includes rank, price, hourly/daily/weekly/monthly changes, volume, market cap, and supply.
- **`/history <SYMBOL> <YYYY-MM-DD>`** — Fetch historical price, market cap, and circulating supply for a specific date (e.g., `/history BTC 2025-01-15`).

Powered by [CoinMarketCap](https://coinmarketcap.com/api/) and [CryptoCompare](https://min-api.cryptocompare.com/) APIs.

## Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with the following variables:
   ```
   CMC_API_KEY=your_coinmarketcap_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

3. Start the bot:
   ```bash
   node main.js
   ```
