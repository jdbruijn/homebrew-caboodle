import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as mustache from 'mustache';
import download from 'download';
import * as crypto from 'crypto';

interface Config {
  name: string;
  package: string;
  template: string;
  urlTemplate: string;
  versions: string[];
}

async function readConfig(path: string): Promise<Config> {
  const data = await fsp.readFile(path, 'utf8');
  return JSON.parse(data);
}

async function readTemplate(path: string): Promise<string> {
  return await fsp.readFile(path, 'utf8');
}

async function getLocalFormulaeVersions(
  directory: string,
  name: string
): Promise<string[]> {
  const items = await fsp.readdir(directory);
  let formulae = [];

  items.forEach((item: string) => {
    const path = directory + '/' + item;
    const re = new RegExp('.*' + name + '@(\\d+\\.\\d+\\.\\d+)\\.rb');
    const match = path.match(re);

    if (match !== null && match.length == 2) {
      formulae.push(match[1]);
    }
  });
  return formulae;
}

function uniqueVersions(a: string[], b: string[]): string[] {
  return a.filter((item: string) => !b.includes(item));
}

async function calculateSha256FromUrl(url: string): Promise<string> {
  const data = await download(url);

  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

async function writeFormula(path: string, data: string): Promise<void> {
  return await fsp.writeFile(path, data, 'utf8');
}

function exists(path: string): true | string {
  let absolutePath = path;
  if (!path.startsWith('/') && !path.startsWith('\\')) {
    absolutePath = process.cwd() + '/' + path;
  }

  if (fs.existsSync(absolutePath)) {
    return true;
  }
  return "Path doesn't exists on the filesystem";
}

interface Answers {
  configPath: string;
  newFormulaeOnly: boolean;
}

const questions = [
  {
    type: 'input',
    name: 'configPath',
    message: 'Enter the path of the configuration file',
    validate: exists,
    default: './formula-config/cmake.json',
  },
  {
    type: 'confirm',
    name: 'newFormulaeOnly',
    message: 'Only create new formulae?',
    default: true,
  },
];

console.log('Create formula - Create homebrew|linuxbrew formula');
inquirer.prompt(questions).then(async (answers: Answers) => {
  try {
    console.log(chalk.cyan(JSON.stringify(answers, null, 2)));

    const formulaPath = './Formula';
    const config = await readConfig(answers.configPath);
    const template = await readTemplate(config.template);
    let versions = config.versions;
    if (answers.newFormulaeOnly) {
      const localFormulaeVersions = await getLocalFormulaeVersions(
        formulaPath,
        config.package
      );
      versions = uniqueVersions(config.versions, localFormulaeVersions);
    }

    versions.forEach(async (version: string) => {
      console.log(chalk.gray(`Processing ${config.name} v${version}`));
      const url = mustache.render(config.urlTemplate, { version });
      const sha256 = await calculateSha256FromUrl(url);

      const formulaConfig = {
        formulaAt: version.replace(/\./g, ''),
        url,
        sha256,
        version,
      };

      const formula = mustache.render(template, formulaConfig);
      writeFormula(`${formulaPath}/${config.package}@${version}.rb`, formula);
      console.log(chalk.gray(`Created formula for ${config.name} v${version}`));
    });
  } catch (err) {
    console.log(chalk.red(err));
  }
});
