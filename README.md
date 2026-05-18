🚜 Telegram Bot: Virtual Farm

My first clicker game built right inside Telegram! I developed it using the **grammY** framework (JavaScript / Node.js). Player progress is safe and secure—everything saves directly to a local **SQLite** database, so nothing gets lost.
It also includes a subscription check mechanic (great for growing a channel) and a hidden admin panel for broadcasting messages.

🚀 Key Features

- Harvesting Crops:Players can harvest coins once every minute. There is a built-in cooldown timer to prevent spamming.
- Plot Shop: Saved up enough coins? Buy more plots to boost your earnings.
- 💎 VIP Status: The bot automatically checks if the player is subscribed to your Telegram channel. If they are, they get a VIP tag and a 2x income boost on all plots.
- Progress Saving: If the bot crashes or restarts, all player balances and plots stay exactly as they were, thanks to SQLite.
- Admin Broadcast: Using the `/broadcast <text>` command, the admin can send an alert or update to every single user in the database at once.

🛠 Tech Stack

- Node.js
- JavaScript (ES Modules)
- Framework: grammY
- Database: SQLite (`better-sqlite3`)
- Environment variables: `dotenv`

⚙️ How to Run It Locally

1. Clone this repository:

git clone [https://github.com/snrnabi16/telegram-farm-bot.git](https://github.com/snrnabi16/telegram-farm-bot.git)
cd telegram-farm-bot

2.	Install dependencies:

npm install

3.	Create a .env file in the root folder and add your credentials:

BOT_TOKEN=your_bot_token_from_BotFather
ADMIN_ID=your_numeric_telegram_id

4. Start the bot:

node index.js

🤖 Commands
/start — Starts the game and initializes your farm;
👨‍🌾 Моя Ферма — Check your balance, plots, and VIP status;
🌾 Собрать урожай — Collect coins from your plots (once per minute);
🛒 Купить грядку (50 💰) — Upgrade your farm by buying another plot;
💎 Проверить VIP подписку — Verify your channel subscription to claim the 2x bonus;
/broadcast <text> — Send a mass message from the bot (only works for the ADMIN_ID set in .env).

