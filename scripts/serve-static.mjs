import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const portArgIndex = process.argv.findIndex(arg => arg === '--port');
const port = Number(
    portArgIndex >= 0 ? process.argv[portArgIndex + 1] : process.env.PORT
) || 5050;

const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
    res.writeHead(status, {
        'Content-Type': type,
        'Cache-Control': 'no-store'
    });
    res.end(body);
}

function resolveFilePath(requestUrl) {
    const url = new URL(requestUrl, `http://localhost:${port}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = path.normalize(path.join(projectRoot, pathname));
    if (!filePath.startsWith(projectRoot)) return null;
    return filePath;
}

const server = http.createServer((req, res) => {
    const requestedFile = resolveFilePath(req.url || '/');
    if (!requestedFile) {
        send(res, 403, 'Forbidden');
        return;
    }

    fs.stat(requestedFile, (statError, stat) => {
        const filePath = !statError && stat.isDirectory()
            ? path.join(requestedFile, 'index.html')
            : requestedFile;

        fs.readFile(filePath, (readError, data) => {
            if (readError) {
                send(res, 404, 'Not found');
                return;
            }

            const extension = path.extname(filePath).toLowerCase();
            send(res, 200, data, contentTypes[extension] || 'application/octet-stream');
        });
    });
});

server.listen(port, () => {
    console.log(`SDS_Games server running at http://localhost:${port}`);
});
