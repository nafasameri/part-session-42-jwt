const crypto = require('crypto');
module.exports = [{
        id: 1,
        username: 'nafas',
        password: crypto
            .createHash("md5")
            .update('1234' + "hash")
            .digest("hex"),
        salt: "hash"
    },
    {
        id: 2,
        username: 'reza',
        password: crypto
            .createHash("md5")
            .update('1111' + "hash")
            .digest("hex"),
        salt: "hash"
    }
];