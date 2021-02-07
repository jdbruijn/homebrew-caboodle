import * as fs from 'fs';
import Ajv from 'ajv';
import chalk from 'chalk';
import stringify from 'json-stringify-pretty-compact';

export interface Config {
  name: string;
  package: string;
  aptGetDependencies: string[];
  templatePath: string;
  urlTemplate: string;
  versions: string[];
}

export class FormulaConfig {
  private readonly path: string;
  public readonly config: Config;
  private readonly schema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'package', 'templatePath', 'urlTemplate', 'versions'],
    properties: {
      name: { type: 'string' },
      package: { type: 'string' },
      aptGetDependencies: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      templatePath: { type: 'string' },
      urlTemplate: { type: 'string' },
      versions: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
    },
  };

  public constructor(path: string) {
    this.path = path;
    this.config = this.Read();
  }

  public HasAptGetDependencies(): boolean {
    return (
      this.config.aptGetDependencies !== undefined &&
      this.config.aptGetDependencies.length > 0
    );
  }

  private Read(): Config {
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(this.schema);
    const data = fs.readFileSync(this.path, 'utf8');
    const config = JSON.parse(data);

    if (!validate(config)) {
      console.log(chalk.red(stringify(validate.errors)));
      throw new Error('Invalid formula config.');
    }

    return config;
  }
}
