import { Formula, config } from '..';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

class Upload {
  private awsBucket: string;
  private awsDirectoryPrefix: string;
  private formula: Formula;
  private hash: string;
  private bottlePath: string;
  private upstreamPath: string;

  constructor(formula: string, commitHash: string) {
    this.awsBucket = config.get('aws.bucketName');
    this.awsDirectoryPrefix = config.get('aws.directoryPrefix');
    this.formula = new Formula(formula);
    this.hash = this.StandardiseHash(commitHash);
    this.bottlePath = this.formula.BottleFile('x86_64_linux');
    this.upstreamPath = path.join(
      this.awsDirectoryPrefix,
      this.hash,
      this.bottlePath,
    );
  }

  public Upload(): void {
    const data = fs.readFileSync(this.bottlePath);

    const objectParams = {
      Bucket: this.awsBucket,
      Key: this.upstreamPath,
      Body: data,
    };

    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      credentials: {
        accessKeyId: config.get('aws.accessKeyId'),
        secretAccessKey: config.get('aws.secretAccessKey'),
      },
    });

    console.log(`Uploading '${this.bottlePath}' to AWS S3`);
    s3.putObject(objectParams, () => {
      console.log(`'${this.bottlePath} uploaded to ${this.upstreamPath}`);
    });
  }

  private StandardiseHash(hash: string): string {
    return hash.substring(0, 12);
  }
}

class Cli {
  private formula: string;
  private hash: string;

  constructor() {
    this.Parse();

    this.Run();
  }

  private Parse(): void {
    const argv = yargs
      .command('$0 <formula> <hash>', 'Upload a formula to ASW S3', (yargs) => {
        yargs.positional('path', {
          describe: 'Name of the formula to upload',
          type: 'string',
        });
        yargs.positional('hash', {
          describe: 'Git hash of the commit that triggered the current build',
          type: 'string',
        });
      })
      .version(false)
      .help().argv;

    this.formula = argv.formula as string;
    this.hash = argv.hash as string;
  }

  private Run(): void {
    const upload = new Upload(this.formula, this.hash);
    upload.Upload();
  }
}

new Cli();
