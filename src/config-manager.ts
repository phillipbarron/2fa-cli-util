import { existsSync, readFileSync, writeFileSync } from "fs";
import { prompt } from "inquirer";

const CONFIG_FILE_PATH = `${process.env.HOME}/.2fa-cli-util`;

const confirmAction = async (message) => {
  const { userChoice } = await prompt([
    {
      type: "list",
      name: "userChoice",
      message,
      choices: ["Yes", "No"],
    },
  ]);
  return userChoice === "Yes";
};

const updateConfigFile = async (config = {}) => {
  try {
    await writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
    console.log("config updated successfully");
  } catch (error) {
    console.log("failed to update config with error", error);
  }
};

const hasExistingConfig = () => {
  try {
    return existsSync(CONFIG_FILE_PATH);
  } catch (error) {
    console.log("a bad thing happened checking config file:", error);
    throw error;
  }
};

const getConfig = () => {
  const rawdata = readFileSync(CONFIG_FILE_PATH, "utf-8");
  return JSON.parse(rawdata);
};


const addItemToConfig = async (configItem) => {
  if (hasExistingConfig()) {
    const existingConfig = getConfig();
    const isExistingItem = existingConfig.keys.some(
      (item) =>
        item.keyLabel.toLowerCase() === configItem.keyLabel.toLowerCase()
    );
    if (isExistingItem) {
      const overwriteExistingItem = await confirmAction(
        "This will overwrite the existing key. Continue?"
      );
      if (!overwriteExistingItem) {
        console.log("No changes made to existing config");
        return;
      }
    }
    const configItemsToRetain = existingConfig.keys.filter(
      ({ keyLabel }) =>
        keyLabel.toLowerCase() !== configItem.keyLabel.toLowerCase()
    );
    return updateConfigFile({
      ...existingConfig,
      ...{ keys: [...configItemsToRetain, configItem] },
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
      (item) => item.keyLabel.toLowerCase() === configItem.toLowerCase()
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
              (key) => key.keyLabel.toLowerCase() !== configItem.toLowerCase()
            ),
          },
        });
      } else {
        console.log("No changes made to existing config");
        return;
      }
    }
  }
  console.log(
    `there is no "${configItem}" set. No changes made to configuration`
  );
};

const getItems = () => {
  const { keys } = getConfig();
  return keys.map((key) => key.keyLabel);
};

const getItem = (itemLabel) => {
  const { keys } = getConfig();
  return keys.find(
    (key) => key.keyLabel.toLowerCase() === itemLabel.toLowerCase()
  );
};

const getDefaultItem = () => {
  const { defaultKey, keys } = getConfig();
  return keys.find((key) => key.keyLabel === defaultKey);
};

export {
  getConfig,
  hasExistingConfig,
  addItemToConfig,
  removeItemFromConfig,
  getItem,
  getItems,
  updateConfigFile,
  getDefaultItem,
  confirmAction,
};
