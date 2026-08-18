const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://vantiq-platform.web.app';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '👋 Welcome to *VANTIQ* — Premium Trading Signals Platform.', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '🚀 Open VANTIQ', web_app: { url: WEBAPP_URL } }]]
    }
  });
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    'VANTIQ Commands:\n/start – Open the trading signals app\n/help – Show this message\n/support – Contact support'
  );
});

bot.onText(/\/support/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Need help? Reach our support team at support@vantiq.app');
});

bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, 'Use /start to launch VANTIQ, or /help for available commands.');
  }
});

bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

console.log('VANTIQ bot is running...');

// Dummy HTTP server so Render's port check passes (bot itself doesn't need this)
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => res.end('VANTIQ bot is running')).listen(PORT, () => {
  console.log(`Dummy server listening on port ${PORT}`);
});
