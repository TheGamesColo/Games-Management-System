import {createServer } from 'node:http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const hostname = '127.0.0.1';
const port = 8080;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connection = await mysql.createConnection({host: '127.0.0.1', user: 'root', password: '', database: 'gms'});

const server = createServer(async (req, res) => {

    let file = await readPublicFile(req);

    if (req.url === '/api/games_list') {
        const [data] = await connection.execute('SELECT * FROM games');
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
    } else {
        if (file) {
            res.writeHead(200, {'Content-Type': file.contentType});
            res.end(file.data);
        } else {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<h1>Error 404</h1>\n<h2>File not found.</h2>');
        }
    }

});

server.listen(port, hostname, () => {
    console.log(`Server running at ${hostname}:${port}.`);
});


async function readPublicFile(request) {

    let filePath = request.url.split("?")[0];
    filePath = filePath === '/' ? '/index.html' : request.url;
    filePath = path.join(__dirname, 'public', filePath);

    const extension = path.extname(filePath);
    let contentType = 'text/html';

    if (extension === '.css') { contentType = 'text/css'; }
    if (extension === '.js') { contentType = 'application/javascript'; }
    if (extension === '.png') { contentType = 'image/png'; }

    try {

        let data;

        if (extension === '.png') {
            data = await fs.readFile(filePath);
        } else {
            data = await fs.readFile(filePath, 'utf-8');
        }

        return {data, contentType};
    } catch (err) {
        return null;
    }
}