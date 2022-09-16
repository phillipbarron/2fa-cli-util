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
    })\n`
  );
  copyToClipboard(code);
};

const showUsage = () => console.log(
  '\n Usage: \n\t acode [Options] \n\t Options:\n\t\t-a Add key\n\t\t-k [Key name] Get code for named key\n\t\t-r [Key name] Remove named key\n'
);

const go = async () => {
  const { k, a, r, h, help } = argv;
  const configExists = hasExistingConfig();
  
  if (help || h) {
    return showUsage();
  }

  if (a) {
    return addKey();
  }

  if (k) {
    if (typeof k !== "string") {
      console.log(`no key value provided`);
      return showUsage();
    }
    if (configExists) {
      const item = getItem(k);
      if (item) {
        const { key } = item;
        return showPasscode(key)
      } else {
        console.log(`no item with label ${k} is currently configured`);
      }
    }
  }

  if (r) {
    if (typeof r !== "string") {
      console.log(`no key value provided for removal`);
      return showUsage();
    }
    if (configExists) {
      return removeItemFromConfig(r);
    } else {
      console.log('no configuration found');
    }
  }

  if (hasExistingConfig() && getItems().length > 0) {
    welcome();
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
