#!/usr/bin/env node
var notp = require("notp").totp;
const base32 = require("thirty-two");
const clipboardy = require("clipboardy");

const generateAuthCode = () => {
  return notp.gen(base32.decode(process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY));
};

const copyToClipboard = (code) => {
  clipboardy.writeSync(code);
};

const go = () => {
  const code = generateAuthCode();
  console.log(`auth code: ${code} copied to clipboard`);
  copyToClipboard(code);
};

go();
