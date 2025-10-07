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
    let url = req.url.split('?');

    if (url[0] === '/api/games_list') {
        const [data] = await connection.execute('SELECT * FROM games');
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
    } else if (url[0] === '/api/submit' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const data = JSON.parse(body);
            if (data.img_cover == undefined) data.img_cover = null;

            let result;
            if (!data.id) {
                [result] = await connection.execute('INSERT INTO games (title,library,platform,is_physical,status,completion,is_completed,achievs_completed,achievs_all,purchase_date,price,region,comment,rating,img_cover) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                    [data.title, data.library, data.platform, data.is_physical, data.status, data.completion, data.is_completed, data.achievs_completed, data.achievs_all, data.purchase_date, data.price, data.region, data.comment, data.rating, data.img_cover]);
            } else {
                [result] = await connection.execute('UPDATE games SET title=?,library=?,platform=?,is_physical=?,status=?,completion=?,is_completed=?,achievs_completed=?,achievs_all=?,purchase_date=?,price=?,region=?,comment=?,rating=?,img_cover=? WHERE id=?',
                    [data.title, data.library, data.platform, data.is_physical, data.status, data.completion, data.is_completed, data.achievs_completed, data.achievs_all, data.purchase_date, data.price, data.region, data.comment, data.rating, data.img_cover, data.id]);
            }

            if (result.affectedRows === 1) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({response: 200, id: result.insertId}));
            }
        });
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
    if (filePath === '/') { filePath = '/index.html'; }
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