/**
 * שרת HTTP מינימלי (רק Node סטנדרטי) — מגיש את dist/ אחרי build.
 * כתובת ברירת מחדל: http://127.0.0.1:3335/ (לא מתנגש עם npm run dev על 3333)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = Number(process.env.PORT) || 3335;
const DIST = path.resolve(__dirname, '..', 'dist');
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function safeResolveUrl(reqUrl) {
  try {
    const u = new URL(reqUrl, 'http://127.0.0.1');
    let p = u.pathname;
    if (p === '/' || p === '') p = '/index.html';
    const normalized = path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, '');
    const full = path.join(DIST, normalized);
    if (!full.startsWith(DIST)) return null;
    return full;
  } catch {
    return null;
  }
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', type);
    res.end(data);
  });
}

if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('\nחסר build: הרץ מתיקיית הפרויקט:\n  npm run build\n');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    return res.end();
  }
  const filePath = safeResolveUrl(req.url);
  if (!filePath) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      if (req.method === 'HEAD') {
        res.statusCode = 200;
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        return res.end();
      }
      return sendFile(filePath, res);
    }
    const fallback = path.join(DIST, 'index.html');
    fs.readFile(fallback, (e2, html) => {
      if (e2) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.end('index.html missing');
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    });
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\nהפורט ${PORT} תפוס. סגור תהליך אחר או הרץ:\n  set PORT=3344 && node scripts/static-server.cjs\n`);
  } else {
    console.error(e);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log(`\n  מוכן — פתח בדפדפן:\n  ${url}\n  (Ctrl+C לעצור)\n`);
  if (process.env.NO_OPEN !== '1' && process.platform === 'win32') {
    exec(`start "" "${url}"`, () => {});
  }
});
