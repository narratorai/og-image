const { parseRequest } = require('./parser'); 
const { getScreenshot } = require('./chromium');
const { getHtml } = require('./template');
const { writeTempFile, pathToFileURL } = require('./file');

async function handler(req, res) {
    try {
        let {
            type = 'png',
            text = 'Hello',
            fontWeight = 'bold',
            image = 'now-black',
        } = parseRequest(req);
        const name = decodeURIComponent(text);
        const html = getHtml(name, fontWeight, image);
        const filePath = await writeTempFile(name, html);
        const fileUrl = pathToFileURL(filePath);
        const file = await getScreenshot(fileUrl, type);
        res.statusCode = 200;
        res.setHeader('Content-Type', `image/${type}`);
        res.setHeader('Cache-Control', `public, immutable, no-transform, max-age=31536000`);
        res.end(file);
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
        console.error(e.message);
    }
};


if (!process.env.NOW_REGION) {
    const { createServer } = require('http');
    const PORT = process.env.PORT || 3000;
    const listen = () => console.log(`Listening on ${PORT}...`);
    createServer(handler).listen(PORT, listen);
}

module.exports = handler;