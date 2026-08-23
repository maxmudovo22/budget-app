// Telegram webhook — Vercel serverless function (Node runtime)
// Secrets come from env vars set in the Vercel project, not from source.
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://maxmudovo22.github.io/budget-app/';
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

// Mirrors CATS/ICONS in index.html — bot must only ever produce categories
// the Mini App actually knows how to display/group, so unmapped words fall
// back to "Другое" instead of inventing a new category.
const EXPENSE_MAP = {
  'такси': 'Транспорт', 'транспорт': 'Транспорт', 'автобус': 'Транспорт',
  'метро': 'Транспорт', 'маршрутка': 'Транспорт', 'бензин': 'Транспорт',
  'продукты': 'Продукты', 'магазин': 'Продукты', 'еда': 'Продукты',
  'обед': 'Кафе', 'кафе': 'Кафе', 'ресторан': 'Кафе',
  'кофе': 'Кафе', 'ужин': 'Кафе', 'завтрак': 'Кафе',
  'кино': 'Развлечения', 'игры': 'Развлечения', 'игра': 'Развлечения', 'развлечения': 'Развлечения',
  'одежда': 'Одежда', 'обувь': 'Одежда',
  'аптека': 'Здоровье', 'лекарства': 'Здоровье', 'врач': 'Здоровье',
  'аренда': 'Жильё', 'квартира': 'Жильё', 'коммуналка': 'Жильё',
  'телефон': 'Связь', 'интернет': 'Связь',
  'учёба': 'Образование', 'курс': 'Образование',
};

const INCOME_MAP = {
  'зп': 'Зарплата', 'зарплата': 'Зарплата', 'аванс': 'Зарплата',
  'фриланс': 'Фриланс', 'проект': 'Фриланс',
  'подарок': 'Подарок',
  'инвестиции': 'Инвестиции',
  'продажа': 'Продажа',
};

function guessCategory(word, type) {
  const w = word.toLowerCase();
  const map = type === 'income' ? INCOME_MAP : EXPENSE_MAP;
  return map[w] || 'Другое';
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

function fmtSum(n) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' сум';
}

async function getTotals(chatId) {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/transactions?user_id=eq.${chatId}&select=type,amount`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    let income = 0, expense = 0;
    for (const r of rows) {
      const amt = parseFloat(r.amount);
      if (r.type === 'income') income += amt; else expense += amt;
    }
    return { income, expense };
  } catch {
    return null;
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
        'Привет! Я твой финансовый ассистент 💸\n\nПросто отправь мне сумму и категорию.\nНапример:\n<b>15000 такси</b> (сохранится как расход)\n<b>+200000 аванс</b> (сохранится как доход)\n\nКоманда <b>/баланс</b> — сводка по доходам и расходам.',
        webAppKeyboard
      );
      res.status(200).end();
      return;
    }

    if (text === '/баланс' || text.toLowerCase() === '/balance') {
      const totals = await getTotals(chatId);
      if (!totals) {
        await sendMessage(chatId, '⚠️ Не удалось получить баланс, попробуй позже.', webAppKeyboard);
      } else {
        const { income, expense } = totals;
        const balance = income - expense;
        const reply =
          `💰 Баланс: <b>${fmtSum(balance)}</b>\n\n` +
          `🟢 Доходы: <b>${fmtSum(income)}</b>\n` +
          `🔴 Расходы: <b>${fmtSum(expense)}</b>`;
        await sendMessage(chatId, reply, webAppKeyboard);
      }
      res.status(200).end();
      return;
    }

    const match = text.match(/^([+-]?\d+)\s+(.+)$/u);
    if (match) {
      const amountStr = match[1];
      const type = amountStr.startsWith('+') ? 'income' : 'expense';
      const amount = Math.abs(parseFloat(amountStr));
      const rawWord = match[2].trim();
      const name = rawWord.charAt(0).toUpperCase() + rawWord.slice(1).toLowerCase();
      const category = guessCategory(rawWord, type);

      const ok = await supabaseInsert('transactions', {
        user_id: chatId,
        type,
        amount,
        name,
        category,
      });

      const sign = type === 'income' ? '🟢 Доход' : '🔴 Расход';
      const savedMark = ok ? '✅ Сохранено!' : '⚠️ Не удалось сохранить';
      const reply = `${savedMark}\n\n${sign}: <b>${fmtSum(amount)}</b>\nКатегория: <b>${category}</b>`;
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
