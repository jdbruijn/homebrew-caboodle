import { config, Formula } from '..';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

class Cli {
  private formulaPath: string;
  private hash: string;

  constructor() {
    this.Parse();

    this.Run();
  }

  Parse(): void {
    const argv = yargs
      .command('$0 <formula> <hash>', 'Upload a formula to ASW S3', yargs => {
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

    const formula = argv.formula as string;
    const formulaPath = config.get('formula.path');
    this.formulaPath = path.join(formulaPath, `${formula}.rb`);
    this.hash = (argv.hash as string).substring(0, 12);

    console.log(`Hash: '${this.hash}`);
  }

  private Run(): void {
    const formula = new Formula(this.formulaPath);
    const bottleFile = `${
      formula.name
    }-${formula.Version()}.x86_64_linux.bottle.tar.gz`;

    console.log(`Uploading ${bottleFile}`);
    try {
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        credentials: {
          accessKeyId: config.get('aws.accessKeyId'),
          secretAccessKey: config.get('aws.secretAccessKey'),
        },
      });

      const data = fs.readFileSync(bottleFile);
      const file = path.join('d1e04fd2b', bottleFile);

      const objectParams = {
        Bucket: config.get('aws.bucketName'),
        Key: file,
        Body: data,
      };
      console.log('upload');
      s3.putObject(objectParams, data => {
        console.log(`Uploaded '${file}' to S3`, data);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

new Cli();
