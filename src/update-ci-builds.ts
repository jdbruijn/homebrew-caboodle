import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as yaml from 'js-yaml';
import * as sort from 'alphanum-sort';

async function getLocalFormulae(directory: string): Promise<string[]> {
  let items = await fsp.readdir(directory);
  let formulae = [];

  items = sort(items);
  items.forEach((item: string) => {
    const path = directory + '/' + item;
    const re = new RegExp('^.*' + '@\\d+\\.\\d+\\.\\d+\\.rb$');
    const match = path.match(re);

    if (match !== null) {
      formulae.push(item);
    }
  });
  return formulae;
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
  formulaPath: string;
}

const questions = [
  {
    type: 'input',
    name: 'formulaPath',
    message: 'Enter the path of the Formula directory',
    validate: exists,
    default: './Formula',
  },
];

console.log('Update CI builds - Update Formula for CI build script(s)');
inquirer.prompt(questions).then(async (answers: Answers) => {
  try {
    const config = await fsp.readFile('./shippable.yml', 'utf8');
    const doc = yaml.safeLoad(config);
    const localFormulae = await getLocalFormulae(answers.formulaPath);

    const matrix = [];
    localFormulae.forEach(async (formula: string) => {
      matrix.push({ FORMULA: formula });
    });

    doc.env.matrix = matrix;

    await fsp.writeFile('./shippable.yml', yaml.safeDump(doc), 'utf8');
    console.log(chalk.green("Written changes to './shippable.yml'"));
  } catch (err) {
    console.log(chalk.red(err));
  }
});
