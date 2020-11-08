import * as models from '../models';
import Joi from 'joi';
import dotenv from 'dotenv';

type RecursivePartial<T> = {
  [K in keyof T]?: RecursivePartial<T[K]>;
};

class Config {
  private readonly schema = Joi.object({
    aws: Joi.object({
      accessKeyId: Joi.string()
        .label('HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID')
        .alphanum()
        .required(),
      secretAccessKey: Joi.string()
        .label('HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY')
        .alphanum()
        .required(),
      region: Joi.string()
        .label('HOMEBREW_CABOODLE_AWS_REGION')
        .pattern(/^[a-zA-Z0-9-]+$/)
        .default('eu-central-1'),
      bucketName: Joi.string()
        .label('HOMEBREW_CABOODLE_AWS_BUCKET_NAME')
        .pattern(/^[a-zA-Z0-9-]+$/)
        .default('homebrew-pc'),
    }).required(),
  });

  private config!: models.Config.Config;
  private readonly unvalidatedConfig: Readonly<
    RecursivePartial<models.Config.Config>
  >;

  constructor() {
    dotenv.config();

    this.unvalidatedConfig = {
      aws: {
        accessKeyId: process.env.HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY,
        region: process.env.HOMEBREW_CABOODLE_AWS_REGION,
        bucketName: process.env.HOMEBREW_CABOODLE_AWS_BUCKET_NAME,
      },
    };
  }

  value(): models.Config.Config {
    if (!this.config) {
      this.validate();
    }

    return this.config;
  }

  validate(): void {
    const validation = this.schema.validate(this.unvalidatedConfig, {
      abortEarly: false,
    });

    if (validation.error) {
      const message = validation.error.details.map((e) => e.message).join('\n');
      throw new Error(message);
    }

    this.config = validation.value;
  }
}

const config = new Config();

export default config;
export { Config };
