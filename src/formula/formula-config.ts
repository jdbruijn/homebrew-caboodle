import Ajv from 'ajv';
import * as fs from 'fs';
import chalk from 'chalk';
import stringify from 'json-stringify-pretty-compact';

interface Config {
  name: string;
  package: string;
  aptGetDependencies: string[];
  template: string;
  urlTemplate: string;
  versions: string[];
}

function get(path: string): Config {
  const ajv = new Ajv({ allErrors: true });
  const configSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'package', 'template', 'urlTemplate', 'versions'],
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
      template: { type: 'string' },
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
  const validate = ajv.compile(configSchema);

  const data = fs.readFileSync(path, 'utf8');
  const config = JSON.parse(data);

  if (!validate(config)) {
    console.log(chalk.yellow(stringify(validate.errors)));
    throw new Error('Invalid formula config.');
  }

  return config as Config;
}

export default { get };
