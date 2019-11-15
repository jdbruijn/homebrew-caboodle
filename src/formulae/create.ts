/**
 * Create multiple formulae.
 *
 * Should use inquirer with choises formula-config/*.json
 * Intitally just write all formulae. Later on can add option to update existing formulae.
 */

import { FormulaConfig, FormulaCreate, config } from '..';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

const formulaConfigPath = config.get('formula.configPath');

const filesInDir = fs.readdirSync(formulaConfigPath);
const files = filesInDir.map((file): string => {
  return path.join(formulaConfigPath, file);
});

const choices = files.filter((file): boolean => {
  return path.extname(file) === '.json';
});

const questions = [
  {
    type: 'list',
    name: 'formula',
    message: 'Select the formula to create',
    choices,
  },
];

inquirer.prompt(questions).then((answers): void => {
  const formula = answers.formula as string;
  console.log(answers, typeof answers.formula);

  try {
    const formulaConfig = new FormulaConfig(formula);
    formulaConfig.config.versions.forEach((version: string): void => {
      console.log(`Creating ${formulaConfig.config.name} v${version}`);
      new FormulaCreate(formula, version);
      // Create formulae with the given formulae config.
    });
  } catch (e) {
    console.log(e);
  }
});
