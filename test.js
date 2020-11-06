var notp = require('notp').totp;
const base32 = require('thirty-two');
var code = notp.gen(base32.decode("YOUR_ONE_TIME_PASWORD_TOKEN"));
console.log(code) 
