// CG Fugu Relay: przyjmuje zapytanie z n8n, dokleja klucz Sakana z env,
// przekazuje do api.sakana.ai z amerykanskiego IP Vercel (region iad1), oddaje odpowiedz 1:1.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if ((req.headers['x-relay-secret'] || '') !== process.env.RELAY_SECRET) {
    return res.status(401).json({ error: 'bad relay secret' });
  }
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const upstream = await fetch('https://api.sakana.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.SAKANA_KEY
      },
      body: body
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: 'relay upstream failed', detail: String(e) });
  }
}
