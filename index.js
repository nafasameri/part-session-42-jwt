const redis = require('redis');
const crypto = require('crypto');

const user = {
    username: 'nafas',
    pass: '8fRBLrDekd60UbnQz/l/bpxOSsucRWCWMvWgCDXCX7M='
};

const client = redis.createClient(6379, '127.0.0.1', {});
client.connect();
client.select(2);
client.set(user.pass, JSON.stringify(user));


function validatePassword(password, originalHash, callback) {
    const iterations = 1000;
    const hashBytes = Buffer.from(originalHash, 'base64');
    const salt = hashBytes.slice(1, 17);
    const hash = hashBytes.slice(17, 49);
    crypto.pbkdf2(password, salt, iterations, hash.length, 'sha1', function (err, hashed) {
        if (err) return callback(err);
        const hashedBase64 = Buffer.from(hashed, 'binary').toString('base64');
        const isValid = fixedTimeComparison(hash.toString('base64'), hashedBase64);
        return callback(null, isValid);
    });
}

const login = async (username, pass) => {
    const User = await client.get(user.pass);
    console.log(User);

    // const key = '123'; //Buffer.concat(['123', '123']);
    // const hmac = crypto.getHashes('sha256', key);
    // hmac.update(Buffer.from(pass, 'ucs2'));
    // const passHash = hmac.digest('base64');


    const jdfkd = validatePassword(pass, user.pass, function (err, isValid) {
        if (err || !isValid) return callback(err || new WrongUsernameOrPasswordError(email));
        callback(null, user.profile);
    });

    // const passHash = crypto.createHash(pass);
    console.log(jdfkd);
};

(async () => {
    // await login('nafas', '123');

    // login('nafas', '123');


    const {
        scrypt,
        randomFill,
        createCipheriv
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
        if (err) throw err;
        // Then, we'll generate a random initialization vector
        randomFill(new Uint8Array(16), (err, iv) => {
            if (err) throw err;

            // Once we have the key and iv, we can create and use the cipher...
            const cipher = createCipheriv(algorithm, key, iv);

            let encrypted = '';
            cipher.setEncoding('hex');

            cipher.on('data', (chunk) => encrypted += chunk);
            cipher.on('end', () => console.log(encrypted));

            cipher.write('some clear text data');
            cipher.end();
        });
    });
});