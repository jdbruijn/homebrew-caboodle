import { FormulaConfig } from '.';
import chalk from 'chalk';
import { config } from '..';
import fs from 'fs';
import path from 'path';

export class Formula {
  public readonly path: string;
  private configPath: string;
  private versionRe = /version "(\d+\.\d+\.\d+)"/;

  public name: string;
  private isVersioned: boolean;
  private version: string;
  private package: string;
  private packageVersion: string;
  private hasBottles = false;
  private bottleHashes: string[];
  private config: FormulaConfig;

  private content: string;
  private hasChanged = false;

  public constructor(formula: string) {
    const formulaPath = config.get('formula.path');
    this.path = path.join(formulaPath, `${formula}.rb`);

    this.Read();
    this.ParseInformation();
    this.PrintInfo();
  }

  public PrintInfo(): void {
    console.log(chalk.green.underline(this.path));
    console.log(chalk.yellow(` name          : '${this.name}'`));
    console.log(chalk.yellow(` configPath    : '${this.configPath}'`));
    console.log(chalk.yellow(` package       : '${this.package}'`));
    console.log(chalk.yellow(` versioned     : ${this.isVersioned}`));
    console.log(chalk.yellow(` version       : '${this.version}'`));
    console.log(chalk.yellow(` packageVersion: '${this.packageVersion}'`));
    if (this.hasBottles) {
      console.log(chalk.yellow(' bottleHashes  : '));
      this.bottleHashes.forEach((hash): void => {
        console.log(chalk.yellow(`                 '${hash}'`));
      });
    }
    console.log(chalk.yellow(' bottleHashes  : '));
    console.log(chalk.yellow(' formulaConfig : '));
    console.log(this.Config().config);
    console.log();
  }

  public SetVersion(version: string): void {
    this.content = this.content.replace(this.versionRe, `version "${version}"`);
    this.hasChanged = true;
  }

  public IsVersioned(): boolean {
    return this.isVersioned;
  }

  public Save(): void {
    if (this.hasChanged) {
      fs.writeFileSync(this.path, this.content, 'utf8');
    }
  }

  public Config(): FormulaConfig {
    if (this.config === undefined) {
      this.config = new FormulaConfig(this.configPath);
    }

    return this.config;
  }

  public Version(): string {
    return this.version;
  }

  public BottleFile(platform: 'x86_64_linux'): string {
    return `${this.name}-${this.Version()}.${platform}.bottle.tar.gz`;
  }

  private Read(): void {
    this.content = fs.readFileSync(this.path, 'utf8');
  }

  private ParseInformation(): void {
    if (!this.content) {
      this.Read();
    }

    this.name = path.basename(this.path, path.extname(this.path));
    const versionedNameMatch = this.name.match(/^([\w\-]+)@(\d+\.\d+\.\d+)/);

    if (versionedNameMatch !== null && versionedNameMatch.length == 3) {
      this.package = versionedNameMatch[1];
      this.packageVersion = versionedNameMatch[2];
      this.isVersioned = true;
    } else {
      this.isVersioned = false;
      this.package = this.name;
    }

    this.configPath = path.join(
      config.get('formula.configPath'),
      `${this.package}.json`,
    );
    const versionMatch = this.content.match(this.versionRe);

    if (versionMatch !== null && versionMatch.length == 2) {
      this.version = versionMatch[1];
      if (!this.isVersioned) {
        this.packageVersion = this.version;
      }
    }

    const bottleHashesMatches = this.content.match(
      /(sha256 "[0-9a-f]{64}" => :\w+)$/gm,
    );
    if (bottleHashesMatches !== null) {
      this.hasBottles = true;
      this.bottleHashes = bottleHashesMatches;
    }
  }
}

// new Formula('./Formula/cmake@3.9.6.rb');
