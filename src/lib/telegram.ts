const BOT_TOKEN = '8736098055:AAGF8bjurzDRWn9-IKixrvG_8p3Ig5eR3bY';
const CHAT_ID = '8646020909';

export async function sendTelegramNudge(message: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=HTML`;
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    return data.ok;
  } catch (err) {
    console.warn('Telegram send failed:', err);
    return false;
  }
}