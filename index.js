#!/usr/bin/env node
var notp = require("notp").totp;
const base32 = require("thirty-two");
const clipboardy = require("clipboardy");

const generateAuthCode = () => {
  return notp.gen(base32.decode(process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY));
};

const copyToClipboard = async (code) => {
  await clipboardy.writeSync(code);
};

const go = async () => {
  const code = generateAuthCode();
  console.log(`auth code: ${code}`);
  await copyToClipboard(code);
};

go();
