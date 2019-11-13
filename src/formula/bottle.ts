import { Formula } from '.';
import chalk from 'chalk';
import fs from 'fs';
import shell from 'shelljs';
import yargs from 'yargs';

class Bottle {
  private readonly formulaPath: string;
  private readonly formula: Formula;
  private systemCommands: string[] = [];

  constructor(formulaPath: string) {
    this.formulaPath = formulaPath;
    this.formula = new Formula(this.formulaPath);

    this.InstallAndTest();
    this.Bottle();
    this.RemoveDoubleDashFromFiles();
    this.ExecuteCommands();
  }

  private InstallAndTest(): void {
    if (this.formula.Config().HasAptGetDependencies()) {
      const commands = [];
      commands.push('apt-get update');
      commands.push(
        `apt-get install -y --no-install-recommends ${this.formula
          .Config()
          .config.aptGetDependencies.join(' ')}`
      );
      commands.push('apt-get clean');
      commands.push('rm -rf /var/lib/apt/lists/*');
      this.systemCommands.push(commands.join(' && '));
    }

    const installArguments = [
      '--include-test',
      '--build-bottle',
      this.formula.path,
    ];
    this.systemCommands.push(
      `HOMEBREW_NO_AUTO_UPDATE=1 brew install ${installArguments.join(' ')}`
    );
    this.systemCommands.push(`brew test ${this.formula.name}`);
  }

  private Bottle(): void {
    const bottleArguments = ['--force-core-tap', this.formula.name];
    this.systemCommands.push(`brew bottle ${bottleArguments.join(' ')}`);
  }

  /**
   * See the following conversation on GitHub for information on the double dash
   * in bottle filenames.
   * https://github.com/Homebrew/brew/commit/d33241bc11054af79c45bd355bf58c7304e18882
   */
  private RemoveDoubleDashFromFiles(): void {
    const bottleFile = `${
      this.formula.name
    }--${this.formula.Version()}.x86_64_linux.bottle.tar.gz`;

    this.systemCommands.push(
      `mv ${bottleFile} ${bottleFile.replace('--', '-')}`
    );
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
    new Bottle(this.formulaPath);
  }
}

new Cli();
