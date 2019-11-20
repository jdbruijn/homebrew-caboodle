import { config } from '.';
import fs from 'fs';
import path from 'path';
import sort from 'alphanum-sort';
import yaml from 'js-yaml';

class UpdateWorkflow {
  private workflowPath: string;
  private formulaPath: string;
  private formulaNames: string[];
  private content: string;

  constructor() {
    this.workflowPath = config.get('workflow.path');
    this.formulaPath = config.get('formula.path');
  }

  public Update(): void {
    this.ReadFormulaNames();
    this.ReadWorkflow();
    this.UpdateWorkflow();
    this.WriteWorkflow();
  }

  private ReadWorkflow(): void {
    this.content = fs.readFileSync(this.workflowPath, 'utf8');
  }

  private WriteWorkflow(): void {
    fs.writeFileSync(this.workflowPath, this.content, 'utf8');
  }

  public ReadFormulaNames(): void {
    this.formulaNames = [];
    const entries = fs.readdirSync(this.formulaPath);

    entries.forEach((entry): void => {
      const extension = path.extname(entry);
      if (extension === '.rb') {
        this.formulaNames.push(path.basename(entry, extension));
      }
    });

    this.formulaNames = sort(this.formulaNames);
  }

  private UpdateWorkflow(): void {
    const workflowYml = yaml.safeLoad(this.content);
    workflowYml.jobs.bottle.strategy.matrix.formula = this.formulaNames;
    this.content = yaml.safeDump(workflowYml);
  }
}

const updateWorkflow = new UpdateWorkflow();
updateWorkflow.Update();
