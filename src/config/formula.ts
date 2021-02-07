import fs from 'fs';
import path from 'path';

type Versions = ReadonlySet<string>;

abstract class Formula {
  public readonly templatePath: string;
  constructor(
    public readonly name: string,
    public readonly packageName: string,
    templatePath: string,
    public readonly aptDependencies: string[] = [],
  ) {
    this.templatePath = templatePath;
    if (!path.isAbsolute(templatePath)) {
      this.templatePath = path.join(__dirname, 'formulae', templatePath);
    }

    this.validateTemplatePath();
  }

  abstract versions(): ReadonlySet<string>;
  abstract url(version: string): string;

  private validateTemplatePath(): void {
    if (
      !fs.existsSync(this.templatePath) ||
      !fs.statSync(this.templatePath).isFile()
    ) {
      throw new Error(
        `Template path '${this.templatePath}' must be an existing file`,
      );
    }
  }

  protected validateVersion(version: string): void {
    if (!this.versions().has(version)) {
      throw new Error(`Version '${version}' not in 'versions()'`);
    }
  }
}

export default Formula;
export { Formula, Versions };
