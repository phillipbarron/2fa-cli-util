#!/usr/bin/env node
var notp = require('notp').totp;
const base32 = require('thirty-two');
const clipboardy = require('clipboardy');
const { selectKey, addKey, welcome } = require('./src/menu');
const {
  hasExistingConfig,
  getItem,
  removeItemFromConfig,
  getItems,
  confirmAction,
} = require('./src/config-manager');
const { getRemainingValiditySeconds } = require('./src/auth-util');

var argv = require('minimist')(process.argv.slice(2));

const generateAuthCode = (key) => {
  if (key) {
    return notp.gen(base32.decode(key));
  }
  console.log('Empty Key');
  process.exit(1);
};

const copyToClipboard = (code) => {
  clipboardy.writeSync(code);
};

const showPasscode = (key) => {
  const code = generateAuthCode(key);
  const remainingValidity = getRemainingValiditySeconds();
  console.log(
    `auth code: ${code} copied to clipboard (valid for ${remainingValidity} second${
      remainingValidity !== 1 ? 's' : ''
    })`
  );
  copyToClipboard(code);
};

const go = async () => {
  welcome();
  const { k, a, r, h, help } = argv;
  const configExists = hasExistingConfig();
  if (help ||  h) {
    return console.log(
      '\n Usage: \n\t acode [Options] \n\t Options:\n\t\t-a Add Key\n\t\t-k [Key Name] get code for named key\n\t\t-r [Key Name] Remove named Key\n'
    );
  }
  if (a) {
    return addKey();
  }
  if (k) {
    if (configExists) {
      const key = getItem(k);
      if (key) {
        return showPasscode(key)
      } else {
        console.log(`not entry found for ${key}`);
      }
    }
  }

  if (r) {
    if (configExists) {
      return removeItemFromConfig(r);
    } else {
      console.log('no configuration found');
    }
  }

  if (hasExistingConfig() && getItems().length > 0) {
    const item = await selectKey();
    showPasscode(item);
  } else {
    const addNewItem = await confirmAction('No keys at present. Add one?');
    if (addNewItem) {
      await addKey();
      return selectKey()
    } else {
      console.log('bye!');
    }
  }
};

go();
