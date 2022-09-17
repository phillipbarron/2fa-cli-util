import inquirer from 'inquirer';
import { yellow } from 'chalk';
import { textSync } from 'figlet';

const { getItems, getItem, addItemToConfig } = require('./config-manager');

const selectKey = async () => {
  const choices = await getItems();
  const { key: keyLabel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'key',
      message: 'Select key',
      choices: [...choices],
    },
  ]);
  const { key } = getItem(keyLabel);
  return key;
};


const welcome = () => {
  console.clear();
  console.log(
    yellow.bgBlack(
      textSync('2fa-cli-util')
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


export {
  addKey,
  selectKey,
  welcome,
};
