#!/usr/bin/env node
var notp = require("notp").totp;
const base32 = require("thirty-two");
const clipboardy = require("clipboardy");

const generateAuthCode = () => {
  if (process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY) {
    return notp.gen(base32.decode(process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY));
  }
  console.log("key not exported");
  process.exit(1);
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
