const fs = require('fs');
const inquirer = require('inquirer');

const CONFIG_FILE_PATH = `${process.env.HOME}/.2fa-cli-util`;

const confirmAction = async (message) => {
  const { userChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'userChoice',
      message,
      choices: ['Yes', 'No'],
    },
  ]);
  return userChoice === 'Yes';
};

const updateConfigFile = async (config = {}) => {
  try {
    await fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
    console.log('config updated successfully');
  } catch (error) {
    console.log('failed to update config with error', error);
  }
};

const hasExistingConfig = () => {
  try {
    return fs.existsSync(CONFIG_FILE_PATH);
  } catch (error) {
    console.log('a bad thing happened checking config file:', error);
    throw error;
  }
};

const getConfig = () => {
  const rawdata = fs.readFileSync(CONFIG_FILE_PATH);
  return JSON.parse(rawdata);
};

const selectDefaultKey = () => {};

const addItemToConfig = async (configItem) => {
  if (hasExistingConfig()) {
    const existingConfig = getConfig();
    const isExistingItem = existingConfig.keys.some(
      (item) => item.keyLabel === configItem.keyLabel
    );
    if (isExistingItem) {
      const overwriteExistingItem = await confirmAction(
        'This will overwrite the existing key. Continue?'
      );
      if (overwriteExistingItem) {
        console.log('No changes made to existing config');
        return;
      }
    }
    return updateConfigFile({
      ...existingConfig,
      ...{ keys: [...existingConfig.keys, configItem] },
    });
  }
  return updateConfigFile({
    keys: [configItem],
    defaultKey: configItem.keyLabel,
  });
};
const removeItemFromConfig = async (configItem) => {
  if (hasExistingConfig()) {
    const existingConfig = getConfig();
    const isExistingItem = existingConfig.keys.some(
      (item) => item.keyLabel === configItem
    );
    if (isExistingItem) {
      const removeKey = await confirmAction(
        `This will remove ${configItem} key value. Continue?`
      );
      if (removeKey) {
        return updateConfigFile({
          ...existingConfig,
          ...{
            keys: existingConfig.keys.filter(
              (key) => key.keyLabel !== configItem
            ),
          },
        });
      } else {
        console.log('No changes made to existing config');
        return;
      }
    }
  }
  console.log('done nout');
};

const getItems = () => {
  const { keys } = getConfig();
  return keys.map((key) => key.keyLabel);
};

const getItem = (itemLabel) => {
  const { keys } = getConfig();
  return keys.find((key) => key.keyLabel === itemLabel);
};

const getDefaultItem = () => {
  const { defaultKey, keys } = getConfig();
  return keys.find((key) => key.keyLabel === defaultKey);
};

module.exports = {
  getConfig,
  hasExistingConfig,
  addItemToConfig,
  removeItemFromConfig,
  getItem,
  getItems,
  selectDefaultKey,
  updateConfigFile,
  getDefaultItem,
  confirmAction,
};