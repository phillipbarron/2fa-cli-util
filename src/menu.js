const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const { getItems, getItem, addItemToConfig } = require('./config-manager');

const selectKey = async () => {
  const choices = await getItems();
  const { key: keyLabel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'key',
      message: 'What do you want a code for?',
      choices: [...choices],
    },
  ]);
  const { key } = getItem(keyLabel);
  return key;
};


const welcome = () => {
  clear();
  console.log(
    chalk.yellow.bgBlack(
      figlet.textSync('2fa-cli-util')
    )
  )
}

const addKey = async () => {
  const keyQuestions = [
    {
      type: 'input',
      name: 'keyLabel',
      message: 'Name for this key',
    },
    {
      type: 'input',
      name: 'name',
      message: 'username associated with this key',
      default() {
        return 'none';
      },
    },
    {
      type: 'input',
      name: 'key',
      message: 'Enter the TOTP key',
    },
  ];

  const item = await inquirer.prompt(keyQuestions);

  addItemToConfig(item)
};


module.exports = {
  addKey,
  selectKey,
  welcome,
};
