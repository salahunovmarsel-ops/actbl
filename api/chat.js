// ECOM KG — серверная функция AI-помощника (Vercel).
// Ключ Anthropic хранится в переменной окружения ANTHROPIC_API_KEY (в настройках Vercel),
// в браузер он НЕ попадает. Модель можно сменить через ANTHROPIC_MODEL (по умолчанию claude-opus-5;
// для экономии можно указать claude-haiku-4-5).

var SYSTEM = [
  'Ты — AI-помощник платформы ECOM KG. Платформу создала ACTBL — Ассоциация трансграничной',
  'электронной торговли и логистики Кыргызской Республики.',
  'Ты помогаешь селлерам и предпринимателям Кыргызстана по электронной коммерции:',
  'маркетплейсы (Wildberries, Ozon, Kaspi, Uzum), логистика и карго из Китая, фулфилмент,',
  'экспорт, финансы; а также рассказываешь о самой платформе ECOM KG — членство, каталог',
  'партнёров, обучение, мероприятия, личные кабинеты, чат с компаниями.',
  'Отвечай по-русски, коротко, дружелюбно и по делу (2–5 предложений).',
  'Если спрашивают про оплату или деньги — поясни, что онлайн-оплата подключается, и предложи',
  'зарегистрироваться или оставить заявку компании через каталог.',
  'Не выдумывай конкретные тарифы и цифры — предлагай уточнить у партнёров в каталоге.',
  'Если вопрос не про e-commerce или платформу — вежливо верни разговор к теме.'
].join(' ');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ reply: 'Method not allowed' }); return; }
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({ reply: 'AI-помощник ещё не подключён. Добавьте ключ ANTHROPIC_API_KEY в настройках Vercel (Environment Variables) и передеплойте.' });
    return;
  }
  try {
    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    var messages = (body && Array.isArray(body.messages)) ? body.messages : [];
    messages = messages
      .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(); })
      .slice(-10)
      .map(function (m) { return { role: m.role, content: m.content.slice(0, 2000) }; });
    if (!messages.length) { res.status(200).json({ reply: 'Задайте вопрос — я помогу по платформе ECOM KG и электронной торговле.' }); return; }

    var model = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
    var r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ model: model, max_tokens: 1024, system: SYSTEM, messages: messages })
    });
    var data = await r.json();
    if (!r.ok) {
      res.status(200).json({ reply: 'Извините, помощник временно недоступен. Попробуйте позже.' });
      return;
    }
    var text = (data.content || [])
      .filter(function (b) { return b.type === 'text'; })
      .map(function (b) { return b.text; })
      .join('\n').trim();
    res.status(200).json({ reply: text || 'Извините, не удалось сформировать ответ.' });
  } catch (e) {
    res.status(200).json({ reply: 'Извините, произошла ошибка. Попробуйте позже.' });
  }
};
