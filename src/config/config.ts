import convict from 'convict';
import 'dotenv/config';

export const config = convict({
  ci: {
    workflowPath: {
      format: String,
      default: './.github/workflow.yml',
    },
  },
  formula: {
    configPath: {
      format: String,
      default: './formula-config',
    },
    path: {
      format: String,
      default: './Formula',
    },
  },
  aws: {
    accessKeyId: {
      format: String,
      env: 'AWS_ACCESS_KEY_ID',
      sensitive: true,
      default: '',
    },
    secretAccessKey: {
      format: String,
      env: 'AWS_SECRET_ACCESS_KEY',
      sensitive: true,
      default: '',
    },
    region: {
      format: String,
      default: 'eu-central-1',
    },
    bucketName: {
      format: String,
      default: 'homebrew-pc',
    },
    directoryPrefix: {
      format: String,
      env: 'AWS_DIRECTORY_PREFIX',
      default: 'develop',
    },
  },
});

config.validate({ allowed: 'strict' });
