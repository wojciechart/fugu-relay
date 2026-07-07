// Test regionu: zwraca publiczne IP, z ktorego Vercel wychodzi do internetu.
// Sluzy tylko do sprawdzenia, czy jestesmy w USA. Mozna pozniej usunac.
export default async function handler(req, res) {
  try {
    const r = await fetch('https://ipinfo.io/json');
    const d = await r.json();
    return res.status(200).json({ outboundIp: d.ip, country: d.country, org: d.org, city: d.city });
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
