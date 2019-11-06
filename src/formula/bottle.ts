import { Formula } from '.';
import chalk from 'chalk';
import fs from 'fs';
import shell from 'shelljs';
import yargs from 'yargs';

class Bottle {
  private readonly formulaPath: string;
  private systemCommands: string[];

  constructor(formulaPath: string) {
    this.formulaPath = formulaPath;
    this.InstallAndTest();
    this.ExecuteCommands();
  }

  private InstallAndTest(): void {
    const formula = new Formula(this.formulaPath);

    if (formula.Config().HasAptGetDependencies()) {
      const commands = [];
      commands.push('apt-get update');
      commands.push(
        `apt-get install -y --no-install-recommends ${formula
          .Config()
          .config.aptGetDependencies.join(' ')}`
      );
      commands.push('apt-get clean');
      commands.push('rm -rf /var/lib/apt/lists/*');
      this.systemCommands.push(commands.join(' && '));
    }

    this.systemCommands.push(
      `brew install ${formula.path} --include-test --build-bottle`
    );
    this.systemCommands.push(`brew test ${formula.name}`);
  }

  private ExecuteCommands(): void {
    this.systemCommands.forEach((command): void => {
      console.log(`Executing command '${command}'`);
      const result = shell.exec(command);
      if (result.code !== 0) {
        throw new Error(`Command '${command}' returned ${result.code}`);
      }
    });
  }
}

class Cli {
  private formulaPath: string;

  constructor() {
    this.Parse();
    this.ValidateFormulaPathExists();

    this.Run();
  }

  private Parse(): void {
    const argv = yargs
      .command('$0 <path>', 'Bottle a formula', yargs => {
        yargs.positional('path', {
          describe: 'Path of the formula and bottle',
          type: 'string',
        });
      })
      .version(false)
      .help().argv;

    this.formulaPath = argv.path as string;
  }

  private ValidateFormulaPathExists(): void {
    if (
      !fs.existsSync(this.formulaPath) ||
      !fs.statSync(this.formulaPath).isFile()
    ) {
      console.log(chalk.red(`File '${this.formulaPath}' doesn't exist.`));
      process.exit(1);
    }
  }

  private Run(): void {
    const bottle = new Bottle(this.formulaPath);
  }
}

new Cli();
