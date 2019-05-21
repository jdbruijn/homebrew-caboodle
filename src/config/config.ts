import convict from 'convict';
import 'dotenv/config';

const config = convict({
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
      env: 'AWS_REGION',
      default: 'eu-central-1',
    },
    bucketName: {
      format: String,
      env: 'AWS_BUCKET_NAME',
      default: 'homebrew-pc',
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
