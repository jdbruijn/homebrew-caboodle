import { Config, FormulaConfig } from '..';
import { config } from '..';
import crypto from 'crypto';
import fs from 'fs';
import mustache from 'mustache';
import path from 'path';
import request from 'request';
import { version } from '../../package.json';

export class FormulaCreate {
  private configPath: string;
  private version: string;
  private config: Config;
  private url: string;
  private sha256: string;

  constructor(configPath: string, version: string) {
    this.configPath = configPath;
    this.version = version;

    this.ReadConfig();
    this.SetUrl();

    this.DownloadAndWrite();
  }

  private ReadConfig(): void {
    this.config = new FormulaConfig(this.configPath).config;
  }

  private SetUrl(): void {
    this.url = mustache.render(this.config.urlTemplate, {
      version: this.version,
    });
  }

  private Write(): void {
    const view = {
      formulaAt: this.version.replace(/\./g, ''),
      url: this.url,
      sha256: this.sha256,
      version,
    };

    const template = fs.readFileSync(this.config.templatePath, 'utf8');
    const formulaContent = mustache.render(template, view);

    const formulaPath = config.get('formula.path');
    const destination = path.join(
      formulaPath,
      `${this.config.package}@${this.version}.rb`,
    );
    fs.writeFileSync(destination, formulaContent, 'utf8');
  }

  private DownloadAndWrite(): void {
    const sha256 = crypto.createHash('sha256');
    request(this.url)
      .on('data', (chunk): void => {
        sha256.update(chunk);
      })
      .on('end', (): void => {
        this.sha256 = sha256.digest('hex');
        this.Write();
        console.log(`Created formula ${this.config.package}@${this.version}`);
      });
  }
}
