import { Bot, Keyboard, session } from "grammy";
import Database from "better-sqlite3";
import "dotenv/config";

const bot = new Bot(process.env.BOT_TOKEN);
const CHANNEL_USERNAME = "@uniyfermer"; 

const ADMIN_ID = Number(process.env.ADMIN_ID); 

const db = new Database("database.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        data TEXT
    )
`).run();

const sqliteStorage = {
    read(key) {
        const row = db.prepare("SELECT data FROM sessions WHERE id = ?").get(key);
        return row ? JSON.parse(row.data) : undefined;
    },
    write(key, value) {
        const dataStr = JSON.stringify(value);
        db.prepare("INSERT OR REPLACE INTO sessions (id, data) VALUES (?, ?)")
          .run(key, dataStr);
    },
    delete(key) {
        db.prepare("DELETE FROM sessions WHERE id = ?").run(key);
    }
};

function createInitialSessionData() {
    return {
        coins: 100,
        plots: 1,
        lastHarvest: 0,
        isVip: false
    };
}

bot.use(session({
    initial: createInitialSessionData,
    storage: sqliteStorage
}));

const gameKeyboard = new Keyboard()
    .text("👨‍🌾 Моя Ферма").text("🌾 Собрать урожай")
    .row()
    .text("🛒 Купить грядку (50 💰)").text("💎 Проверить VIP подписку")
    .resized();

bot.command("start", (ctx) => {
    return ctx.reply("Привет на ферме! Твой прогресс теперь надежно защищен базой данных SQLite!", {
        reply_markup: gameKeyboard
    });
});

bot.hears("💎 Проверить VIP подписку", async (ctx) => {
    try {
        const chatMember = await ctx.api.getChatMember(CHANNEL_USERNAME, ctx.from.id);
        const isSubscribed = ["creator", "administrator", "member"].includes(chatMember.status);

        if (isSubscribed) {
            ctx.session.isVip = true;
            return ctx.reply("🎉 Статус 💎 VIP-фермер успешно активирован!");
        } else {
            ctx.session.isVip = false;
            return ctx.reply(`❌ Подпишись на канал ${CHANNEL_USERNAME} для активации VIP.`);
        }
    } catch (error) {
        console.error("Ошибка проверки подписки:", error);
        return ctx.reply("⚠️ Не удалось проверить подписку. Проверь настройки бота в канале.");
    }
});

bot.hears("👨‍🌾 Моя Ферма", (ctx) => {
    const { coins, plots, isVip } = ctx.session;
    const moneyPerPlot = isVip ? 20 : 10;
    
    return ctx.reply(
        `🚜 *Твоя ферма:* ${isVip ? "💎 [VIP]" : ""}\n\n` +
        `💰 Баланс: ${coins} монет\n` +
        `🌱 Грядок в наличии: ${plots} шт.\n` +
        `📈 Твой доход: ${moneyPerPlot} 💰 за грядку.`,
        { parse_mode: "Markdown" }
    );
});

bot.hears("🌾 Собрать урожай", (ctx) => {
    const now = Date.now();
    const cooldown = 60 * 1000; 
    const timePassed = now - ctx.session.lastHarvest;

    if (timePassed < cooldown) {
        const timeLeft = Math.ceil((cooldown - timePassed) / 1000);
        return ctx.reply(`⏳ Пшеница еще не выросла! Подожди еще ${timeLeft} сек.`);
    }

    const moneyPerPlot = ctx.session.isVip ? 20 : 10;
    const income = ctx.session.plots * moneyPerPlot;
    
    ctx.session.coins += income;
    ctx.session.lastHarvest = now;

    return ctx.reply(`🎉 Урожай собран! +${income} 💰 ${ctx.session.isVip ? "🔥 (Бонус х2!)" : ""}\nБаланс: ${ctx.session.coins} 💰`);
});

bot.hears("🛒 Купить грядку (50 💰)", (ctx) => {
    if (ctx.session.coins < 50) {
        return ctx.reply("❌ Недостаточно монет!");
    }
    ctx.session.coins -= 50;
    ctx.session.plots += 1;
    return ctx.reply(`🌱 Куплена грядка! Всего: ${ctx.session.plots} шт.`);
});

bot.command("broadcast", async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply("❌ У вас нет прав для использования этой команды.");

    const messageToSend = ctx.message.text.replace("/broadcast", "").trim();
    if (!messageToSend) return ctx.reply("❌ Использование: `/broadcast Привет, фермеры! У нас технические работы.`", { parse_mode: "Markdown" });

    const rows = db.prepare("SELECT id FROM sessions").all();
    
    let successCount = 0;
    let failureCount = 0;

    await ctx.reply(`📢 Начинаю рассылку для ${rows.length} пользователей...`);

    for (const row of rows) {
        const targetChatId = row.id;

        try {
            await ctx.api.sendMessage(targetChatId, messageToSend);
            successCount++;
        } catch (error) {

            console.error(`Не удалось отправить сообщение пользователю ${targetChatId}:`, error.message);
            failureCount++;
        }
    }

    return ctx.reply(`✅ Рассылка завершена!\n\nУспешно отправлено: ${successCount}\nНе удалось: ${failureCount}`);
});

console.log("Бот с базой данных и админ-панелью запущен!");
bot.start();