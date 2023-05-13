import { existsSync, readFileSync, writeFileSync } from 'fs';
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

  writeFileSync(
    `${CONFIG_FILE_PATH}.new`,
    JSON.stringify({ keys: asConfig }, null, 2),
  );
};

migrate();
