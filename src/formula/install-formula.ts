import AWS from 'aws-sdk';
import chalk from 'chalk';
import * as fs from 'fs';
import cconfig from '../config/config';
import { promises as fsp } from 'fs';
import * as yargs from 'yargs';
import * as path from 'path';
import formulaConfig from './formula-config';
import * as shell from 'shelljs';

const argv = yargs
  .usage('Usage: $0 <command> [options]')
  .options({
    help: {
      alias: 'h',
      describe: 'Show help',
    },
    formula: {
      alias: 'f',
      describe: '<formula> Path to the formula to install',
      demandOption: true,
    },
  })
  .version(false).argv;

const absoluteFormulaPath = path.resolve(argv.formula as string);

if (!fs.existsSync(absoluteFormulaPath)) {
  console.log(
    chalk.red(`Could not find a formula at '${absoluteFormulaPath}'.`)
  );
  process.exit(1);
}

//
// Script (I guess)
try {
  console.log('parsing...');
  const formulaConfigDir = path.resolve(
    `${path.parse(absoluteFormulaPath).dir}/../formula-config`
  );

  const formulaName = path.parse(absoluteFormulaPath).name;
  const formulaPackage = formulaName.split('@')[0];
  const formulaVersion = formulaName.split('@')[1];
  const formulaConfigPath = path.join(
    formulaConfigDir,
    formulaPackage + '.json'
  );

  console.log(
    absoluteFormulaPath,
    formulaConfigDir,
    formulaName,
    formulaPackage,
    formulaVersion,
    formulaConfigPath
  );

  const config = formulaConfig.get(formulaConfigPath);

  const systemCommands = [];
  if (config.aptGetDependencies && config.aptGetDependencies.length > 0) {
    const aptGetCommand = 'DEBIAN_FRONTEND=noninteractive apt-get';
    systemCommands.push(
      `${aptGetCommand} update` +
        ` && ${aptGetCommand} install -y --no-install-recommends` +
        ` ${config.aptGetDependencies.join(' ')}` +
        ` && ${aptGetCommand} clean`
    );
  }

  systemCommands.push(`brew tap vidavidorra/yard`);
  systemCommands.push(
    `brew install ${formulaName} --include-test --build-bottle`
  );
  systemCommands.push(`brew test ${formulaName}`);
  systemCommands.push(
    `brew bottle --json --root-url="https://homebrew-yard.vidavidorra.com" ${formulaName}`
  );

  systemCommands.forEach(command => {
    console.log(`Executing command '${command}'`);
    const result = shell.exec(command);
    if (result.code !== 0) {
      throw new Error(`Command '${command}' returned ${result.code}`);
    }
  });

  const outputFiles = [
    `${formulaName}--${formulaVersion}.x86_64_linux.bottle.json`,
    `${formulaName}--${formulaVersion}.x86_64_linux.bottle.tar.gz`,
  ];
  outputFiles.forEach(outputFile => {
    if (!fs.existsSync(outputFile)) {
      throw new Error(
        `Expected output file '${outputFile}' is not present on the filesystem`
      );
    }
  });

  console.log(outputFiles);
  // Upload output files...
  console.log(
    chalk.blue('Uploading output files'),
    cconfig.get('aws.bucketName')
  );
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    credentials: {
      accessKeyId: cconfig.get('aws.accessKeyId'),
      secretAccessKey: cconfig.get('aws.secretAccessKey'),
    },
  });

  outputFiles.forEach(file => {
    fs.readFile(file, (err, data) => {
      if (err) {
        throw err;
      }

      const objectParams = {
        // ACL: 'public',
        Bucket: cconfig.get('aws.bucketName'),
        Key: file,
        Body: data,
      };
      s3.putObject(objectParams, data => {
        console.log(chalk.green(`Yay! Uploaded '${file}' to S3`), data);
      });
    });
  });
} catch (error) {
  console.log(chalk.red(error));
}

// docker run --rm -it -v "$(pwd)":/mnt/yard vidavidorra/docker-linux:ubuntu1804-master
// cd /mnt/yard && npm run build && node ./dist/formula/install-formula.js --formula ./Formula/cmake@3.1.0.rb
