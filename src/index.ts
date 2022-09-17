#!/usr/bin/env node
import { totp } from 'notp';
import { writeSync } from 'clipboardy';
import minimist = require('minimist');
import { selectKey, addKey, welcome } from './menu';
import {
  hasExistingConfig,
  getItem,
  removeItemFromConfig,
  getItems,
  confirmAction,
} from './config-manager';
import decode from './lib/thirty-two';

const { getRemainingValiditySeconds } = require('./auth-util');

const argv = minimist(process.argv.slice(2));

const generateAuthCode = (key: string) => {
  if (key) {
    return totp.gen(decode(key));
  }
  console.log('Empty Key');
  process.exit(1);
};

const copyToClipboard = (code: string) => {
  writeSync(code);
};

const showPasscode = (key: string) => {
  const code = generateAuthCode(key);
  const remainingValidity = getRemainingValiditySeconds();
  console.log(
    `auth code: ${code} copied to clipboard (valid for ${remainingValidity} second${
      remainingValidity !== 1 ? 's' : ''
    })\n`
  );
  copyToClipboard(code);
};

const printUsageGuide = () => console.log(
  '\n Usage: \n\t acode [Options] \n\t Options:\n\t\t-a Add key\n\t\t-k [Key name] Get code for named key\n\t\t-r [Key name] Remove named key\n'
);

const go = async () => {
  const { k, a, r, h, help } = argv;
  const configExists = hasExistingConfig();
  
  if (help || h) {
    return printUsageGuide();
  }

  if (a) {
    return addKey();
  }

  if (k) {
    if (typeof k !== "string") {
      console.log(`no key value provided`);
      return printUsageGuide();
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
      return printUsageGuide();
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
