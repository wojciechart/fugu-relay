const http = require('http');
const PORT = process.env.PORT || 3000;

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    return send(res, 200, 'text/plain', 'ok');
  }
  if (req.method === 'GET' && req.url === '/whoami') {
    return fetch('https://ipinfo.io/json')
      .then((r) => r.text())
      .then((t) => send(res, 200, 'application/json', t))
      .catch((e) => send(res, 502, 'application/json', JSON.stringify({ error: String(e) })));
  }
  if (req.method === 'POST' && (req.url === '/api/fugu' || req.url === '/fugu')) {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      if ((req.headers['x-relay-secret'] || '') !== process.env.RELAY_SECRET) {
        return send(res, 401, 'application/json', JSON.stringify({ error: 'bad relay secret' }));
      }
      fetch('https://api.sakana.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.SAKANA_KEY },
        body: body,
      })
        .then(async (up) => {
          const text = await up.text();
          send(res, up.status, up.headers.get('content-type') || 'application/json', text);
        })
        .catch((e) => send(res, 502, 'application/json', JSON.stringify({ error: 'relay upstream failed', detail: String(e) })));
    });
    return;
  }
  send(res, 404, 'application/json', JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => console.log('fugu relay listening on ' + PORT));
