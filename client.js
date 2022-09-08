const http = require('http');

const req = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: 'service/login',
    method: 'POST',
}, (res) => {
    res.on('data', (chunk) => {
        console.log(chunk);
    });
});
req.write(JSON.stringify({
    username: 'nafas',
    password: '1234'
}));
req.end();


http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: 'service/users',
    method: 'GET',
}, (res) => {
    res.on('data', (chunk) => {
        console.log(chunk);
    });
}).end();
