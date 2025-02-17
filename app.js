import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, 'index.html');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.js': 'application/javascript',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? indexPath : path.join(__dirname, 'public', req.url);
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


