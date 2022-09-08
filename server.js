const http = require('http');

const router = require('./router');


const server = http.createServer((req, res) => {
    const { url, method } = req;

    if (url in router) {
        return router[url](req, res);
    }
    return router['404'](req, res);
});
const port = process.env.port || 5000;

server.listen(port, () => {
    console.log(`server is running on port ${port}`);
});