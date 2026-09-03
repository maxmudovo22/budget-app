// Vercel Cron hits this daily so Supabase free tier never auto-pauses
// (pause = REST 404/500, swallowed by webhook.js's try/catch, so it fails silently).
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/transactions?select=id&limit=1`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    res.status(200).send(`keepalive ok: ${r.status}`);
  } catch (e) {
    res.status(200).send(`keepalive failed: ${e.message}`);
  }
}
