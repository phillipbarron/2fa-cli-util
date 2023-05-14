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
  algorirthm: string;
  totpSecret: string;
}

interface Configuration {
  keys: ConfigItem[];
}

const getAbsolutePath = (path: unknown) => {
  if (typeof path !== 'string') throw new Error('Path must be a string');
  if (path.startsWith('~'))
    return path.replace('~', process.env.HOME as string);
  return path;
};

const hasExistingConfig = (): boolean => {
  try {
    return existsSync(CONFIG_FILE_PATH);
  } catch (error) {
    console.log('a bad thing happened checking config file:', error);
    throw error;
  }
};

const migrate = async () => {
  const fileLocation = [
    {
      type: 'input',
      name: 'imputFile',
      message: 'location of the exported file to migrate',
    },
  ];

  const { imputFile } = await inquirer.prompt(fileLocation);
  const config = JSON.parse(
    readFileSync(getAbsolutePath(imputFile), 'utf-8'),
  ) as ExportKeyItem[];

  const asConfig = config.map((item) => ({
    keyLabel: item.issuer || item.name,
    name: item.name,
    key: item.totpSecret,
  }));

const configAlreadyExists = await hasExistingConfig();

  if (configAlreadyExists) {
    const EXIT = 'exit';
    const REPLACE = 'replace existing config';
    const BACKUP_AND_REPLACE = 'backup and replace existing config';
    console.log("there is existing config - importing would overwrite");
    const { action } = await inquirer.prompt(
      [
        {
          type: 'rawlist',
          name: 'action',
          message: 'Which is better?',
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
        return;
      }
    }
  }
  writeFileSync(
    `${CONFIG_FILE_PATH}.new`,
    JSON.stringify({ keys: asConfig }, null, 2),
  );
  console.log('config file created');
};

migrate();
