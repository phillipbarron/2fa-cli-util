import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import inquirer from 'inquirer';

export interface ConfigItem {
  keyLabel: string;
  name?: string;
  key: string;
}

const CONFIG_FILE_PATH = `${process.env.HOME}/.2fa-cli-util`;

export interface ExportKeyItem {
  secret: string;
  name: string;
  issuer?: string;
  algorithm: string;
  totpSecret: string;
}

const getAbsolutePath = (path: unknown) => {
  if (typeof path !== 'string') throw new Error('Path must be a string');
  if (path.startsWith('~'))
    return path.replace('~', process.env.HOME as string);
  return path;
};

function isExportKeyItem(arg: any): arg is ExportKeyItem {
  return arg && arg.secret && typeof(arg.secret) == 'string'
  && arg.name && typeof(arg.name) == 'string'
  && arg.algorithm && typeof(arg.algorithm) == 'string'
  && arg.totpSecret && typeof(arg.totpSecret) == 'string';
}


const hasExistingConfig = (): boolean => {
  try {
    return existsSync(CONFIG_FILE_PATH);
  } catch (error) {
    console.log('a bad thing happened checking config file:', error);
    throw error;
  }
};

const migrate = async (): Promise<void> => {
  const fileLocation = [
    {
      type: 'input',
      name: 'inputFile',
      message: 'location of the exported file to migrate',
    },
  ];

  const { inputFile } = await inquirer.prompt(fileLocation);
  const filePath = getAbsolutePath(inputFile);

  if (!existsSync(filePath)) {
    console.log(`file '${filePath}' does not exist`);
    return migrate();
  } 
  
  const config = JSON.parse(
    readFileSync(filePath, 'utf-8'),
  ) as ExportKeyItem[];

  if (Array.isArray(config)) {
    for (const item of config) {
      if (!isExportKeyItem(item)) {
        console.log('invalid item:', item)
      }
    }
  }
  const configIsValid = config.every(isExportKeyItem);

  if (!configIsValid) {
    console.log('File does not contain valid configuration');
    return;
  }

  if (config.length < 1) {
    console.log('File does not contain any values');
    return;
  }

  const asConfig = config.map((item) => ({
    keyLabel: item.issuer || item.name,
    name: item.name,
    key: item.totpSecret,
  }));

const configAlreadyExists = await hasExistingConfig();

  if (configAlreadyExists) {
    const EXIT = 'Exit';
    const REPLACE = 'Replace existing config';
    const BACKUP_AND_REPLACE = 'Backup and replace existing config';
    console.log("there is existing config - importing would overwrite");
    const { action } = await inquirer.prompt(
      [
        {
          type: 'rawlist',
          name: 'action',
          message: 'Choose action',
          choices: [EXIT, REPLACE, BACKUP_AND_REPLACE],
        },
      ]
    )
    switch (action) {
      case EXIT:
        console.log('bye!');
        return;
      case REPLACE: {
        writeFileSync(
          `${CONFIG_FILE_PATH}`,
          JSON.stringify({ keys: asConfig }, null, 2),
        );
        console.log('file replaced');
        return;
      }
      case BACKUP_AND_REPLACE: {
        copyFileSync(CONFIG_FILE_PATH, `${CONFIG_FILE_PATH}.bak`)
        console.log(`Copied config file to ${CONFIG_FILE_PATH}.bak`)
        writeFileSync(
          `${CONFIG_FILE_PATH}`,
          JSON.stringify({ keys: asConfig }, null, 2),
        );
        console.log('New config written');
        return;
      }
    }
  }
  writeFileSync(
    `${CONFIG_FILE_PATH}`,
    JSON.stringify({ keys: asConfig }, null, 2),
  );
  console.log('config file created');
};

migrate();
