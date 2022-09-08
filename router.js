const redis = require('redis');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const users = require('./data/users');
const roles = require('./data/roles');
const premissions = require('./data/premission');
const services = require('./data/services');
const userRole = require('./data/userRole');

let client = null;
const host = '127.0.0.1';

if (client == null) {
    client = redis.createClient(6379, host, {});
    client.connect();
    client.select(2);
}


function generateToken(username, password) {
    const jwtSecretKey = process.env.JWT_SECRET_KEY || 'jwt_secret_key';
    const data = {
        time: Date.now(),
        username: username,
        password: password
    };

    const token = jwt.sign(data, jwtSecretKey);
    return token;
}

const login = async (username, pass) => {
    for (let user of users) {
        if (user.username == username) {
            const hash = crypto.createHash("md5").update(pass + "hash").digest("hex");
            if (user.password === hash) {
                const token = generateToken(username, pass);
                const time = new Date(Date.now() + 10000);
                let setCookieCommand = 'token=' + token + '; Expires=' + time.toUTCString() + '; Path=/' + '; Domain=' + host;
                const key = token.split('.')[2];
                client.set(key, user.id);
                return { token, setCookieCommand };
            }
        }
    }
};

module.exports = {
    '/service/login': async (req, res) => {
        let data = '';
        req.on('data', function (chunk) {
            data += chunk.toString();
        });

        req.on('end', async (chunk) => {
            data = JSON.parse(data);
            const { token, setCookieCommand } = await login(data.username, data.password);
            if (token) {
                res.writeHead(200, { 'Set-Cookie': setCookieCommand, 'token': token });
                return res.end(JSON.stringify({ status: 200, message: 'Authorized' }));
            }
            res.writeHead(401)
            return res.end(JSON.stringify({ status: 401, message: 'Un Authorized' }));
        });
    },
    '/service/users': async (req, res) => {
        let isAuthorized = false;
        const { token } = req.headers;
        if (token) {
            const key = token.split('.')[2];
            const userid = await client.get(key);
            if (userid) {
                isAuthorized = true;
                const resource = [];
                const userRoles = userRole.filter(i => i.user_id == userid);
                for (let ur of userRoles) {
                    const role = roles.filter(i => i.id == ur.role_id)[0];
                    const Premissions = premissions.filter(i => i.role_id == role.id);
                    for (let prem of Premissions) {
                        resource.push(services.filter(i => i.id == prem.service_id)[0]);
                    }
                }

                const isAccess = resource.filter(i => i.address == '/service/users');

                if (isAccess.length == 0)
                    return res.end(JSON.stringify({ status: 'Error!' }));
                return res.end(JSON.stringify({ status: 'OK!' }));
            }
        }
        if (!isAuthorized)
            return res.end(JSON.stringify({ status: 401, message: 'Un Authorized' }));
    },
    '404': (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({ status: 404, message: 'URL Not found!' }));
        return res.end();
    }
};