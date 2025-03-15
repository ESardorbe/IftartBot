import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TG_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

const userVotes = new Map<number, string>();

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "Assalomu aleykum sinfdoshlar uchun iftorlik so‘rovnomasiga hush kelibsiz");
    
    await bot.sendMessage(chatId, "Kontakt ma'lumotlaringizni yuboring", {
        reply_markup: {
            keyboard: [[{ text: "📞 Kontaktni yuborish", request_contact: true }]],
            one_time_keyboard: true,
        },
    });
});

bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    if (!msg.contact) return;
    if (msg.contact.user_id && userVotes.has(msg.contact.user_id)) {
        await bot.sendMessage(chatId, "Siz allaqachon ovoz bergansiz!");
        return;
    }
    
    await bot.sendPoll(chatId, "Iftorlikka borasizmi?", [
        "✅ Ha, albatta!",
        "🤔 Balki borarman",
        "❌ Yo‘q, bora olmayman",
    ], { is_anonymous: false });
});

bot.on('poll_answer', async (pollAnswer) => {
    const userId = pollAnswer.user.id;
    const userName = `${pollAnswer.user.first_name || ''} ${pollAnswer.user.last_name || ''}`.trim();
    const answer = ["✅ Ha, albatta!", "🤔 Balki borarman", "❌ Yo‘q, bora olmayman"][pollAnswer.option_ids[0]];
    
    if (userVotes.has(userId)) return;
    
    userVotes.set(userId, answer);
    await bot.sendMessage(process.env.ADMIN_CHAT_ID as string, `${userName} ovoz berdi: ${answer}`);
});

console.log("Bot ishga tushdi!");
