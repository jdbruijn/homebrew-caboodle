import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as mustache from 'mustache';
import * as download from 'download';
import * as crypto from 'crypto';

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
}

const questions = [
  {
    type: 'input',
    name: 'configPath',
    message: 'Enter the path of the configuration file',
    validate: exists,
    default: './formula-config/cmake.json',
  },
];

inquirer.prompt(questions).then((answers: Answers) => {
  fs.readFile(answers.configPath, 'utf8', (err, configData) => {
    if (err) {
      throw err;
    }

    const config = JSON.parse(configData);

    fs.readFile(config.template, 'utf8', (err, templateData) => {
      if (err) {
        throw err;
      }

      config.versions.forEach((version: string) => {
        const url = mustache.render(config.urlTemplate, { version });

        download(url).then(data => {
          const sha256 = crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');

          const formulaConfig = {
            formulaAt: version.replace(/\./g, ''),
            url,
            sha256,
            version,
          };

          const formula = mustache.render(templateData, formulaConfig);
          fs.writeFile(`Formula/cmake@${version}.rb`, formula, err => {
            if (err) {
              throw err;
            }

            console.log(
              chalk.green(`Created formula for ${config.name} v${version}`)
            );
          });
        });
      });
    });
  });
});
