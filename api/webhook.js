// Telegram webhook — Vercel serverless function (Node runtime)
// Secrets come from env vars set in the Vercel project, not from source.
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://maxmudovo22.github.io/budget-app/';
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

const CATEGORY_MAP = {
  'такси': 'Транспорт', 'транспорт': 'Транспорт', 'автобус': 'Транспорт',
  'метро': 'Транспорт', 'маршрутка': 'Транспорт', 'бензин': 'Транспорт',
  'продукты': 'Продукты', 'магазин': 'Продукты', 'еда': 'Продукты',
  'обед': 'Кафе', 'кафе': 'Кафе', 'ресторан': 'Кафе',
  'кофе': 'Кафе', 'ужин': 'Кафе', 'завтрак': 'Кафе',
  'зп': 'Зарплата', 'зарплата': 'Зарплата', 'аванс': 'Зарплата',
  'фриланс': 'Фриланс', 'проект': 'Фриланс',
  'одежда': 'Одежда', 'обувь': 'Одежда',
  'аптека': 'Здоровье', 'лекарства': 'Здоровье', 'врач': 'Здоровье',
  'аренда': 'Жильё', 'квартира': 'Жильё', 'коммуналка': 'Жильё',
  'телефон': 'Связь', 'интернет': 'Связь',
  'учёба': 'Образование', 'курс': 'Образование',
  'подарок': 'Подарок',
  'инвестиции': 'Инвестиции',
};

function guessCategory(word) {
  const w = word.toLowerCase();
  if (CATEGORY_MAP[w]) return CATEGORY_MAP[w];
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

async function supabaseInsert(table, data) {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendMessage(chatId, text, keyboard) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (keyboard) body.reply_markup = keyboard;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const webAppKeyboard = {
  inline_keyboard: [[{ text: '📊 Открыть FinTrack MX', web_app: { url: WEBAPP_URL } }]],
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(200).send('FinTrack MX webhook is alive');
    return;
  }

  const update = req.body;
  const message = update?.message;
  if (!message) {
    res.status(200).end();
    return;
  }

  const chatId = message.chat.id;
  const text = (message.text || '').trim();

  try {
    if (text === '/start') {
      await sendMessage(
        chatId,
        'Привет! Я твой финансовый ассистент 💸\n\nПросто отправь мне сумму и категорию.\nНапример:\n<b>15000 такси</b> (сохранится как расход)\n<b>+200000 аванс</b> (сохранится как доход)',
        webAppKeyboard
      );
      res.status(200).end();
      return;
    }

    const match = text.match(/^([+-]?\d+)\s+(.+)$/u);
    if (match) {
      const amountStr = match[1];
      const type = amountStr.startsWith('+') ? 'income' : 'expense';
      const amount = Math.abs(parseFloat(amountStr));
      const category = guessCategory(match[2]);

      const ok = await supabaseInsert('transactions', {
        user_id: chatId,
        type,
        amount,
        name: category,
        category,
      });

      const sign = type === 'income' ? '🟢 Доход' : '🔴 Расход';
      const savedMark = ok ? '✅ Сохранено!' : '⚠️ Не удалось сохранить';
      const reply = `${savedMark}\n\n${sign}: <b>${amount.toLocaleString('ru-RU').replace(/,/g, ' ')} сум</b>\nКатегория: <b>${category}</b>`;
      await sendMessage(chatId, reply, webAppKeyboard);
    } else {
      await sendMessage(
        chatId,
        'Не понял формат 🤷‍♂️\n\nНапиши сумму и категорию через пробел.\nНапример: <b>15000 продукты</b>',
        webAppKeyboard
      );
    }
  } catch {
    await sendMessage(chatId, '⚠️ Что-то сломалось, попробуй ещё раз чуть позже.').catch(() => {});
  }

  res.status(200).end();
}
