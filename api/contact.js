async function notifyTelegram(name, email, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `New MyClaw Contact!\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  }).catch(() => {});
}

async function notifyDiscord(name, email, message) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: 'New MyClaw Contact!',
        color: 0x7c3aed,
        fields: [
          { name: 'Name', value: name, inline: true },
          { name: 'Email', value: email, inline: true },
          { name: 'Message', value: message },
        ],
        timestamp: new Date().toISOString(),
      }],
    }),
  }).catch(() => {});
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    const airtableRes = await fetch('https://api.airtable.com/v0/appvcWUjD4JJQwnqC/Contacts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.AIRTABLE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields: { Name: name, Email: email, Message: message, Status: 'Todo' } }]
      }),
    });

    const data = await airtableRes.json();

    if (!airtableRes.ok) {
      return res.status(500).json({ error: 'Failed to submit' });
    }

    // Send notifications (don't block response)
    await Promise.allSettled([
      notifyTelegram(name, email, message),
      notifyDiscord(name, email, message),
    ]);

    return res.status(200).json({ success: true, id: data.records[0].id });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
