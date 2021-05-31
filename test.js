var notp = require('notp').totp;
const base32 = require('thirty-two');
var code = notp.gen(base32.decode(process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY));
console.log(code)
