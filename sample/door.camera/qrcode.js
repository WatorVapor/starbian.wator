const qrcode = require('qrcode-terminal');
const key = require('./keys.json');
qrcode.generate(key.myself);
