import { beforeEach, describe, expect, it, jest } from '@jest/globals';

/**
 * Set environment variables required in the configuration before importing. The
 * configuration normally gets the environment variables from a `.env` file
 * using `dotenv`, which is mocked for this test. By setting the environment
 * variables required in the configuration, the default config is valid.
 */
const awsAccessKeyIdPlaceholder = 'accessKeyId';
const awsSecretAccessKeyPlaceholder = 'secretAccessKeyId';

function setEnvPlaceholders(
  awsAccessKeyId = awsAccessKeyIdPlaceholder,
  awsSecretAccessKey = awsSecretAccessKeyPlaceholder,
) {
  process.env.HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID = awsAccessKeyId;
  process.env.HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY = awsSecretAccessKey;
}
setEnvPlaceholders();

import config, { Config } from './config';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Config', () => {
  beforeEach(() => {
    delete process.env.HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID;
    delete process.env.HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY;
    delete process.env.HOMEBREW_CABOODLE_AWS_REGION;
    delete process.env.HOMEBREW_CABOODLE_AWS_BUCKET_NAME;
  });

  it('exports a default configuration, set during construction', () => {
    expect(config.value().aws.accessKeyId).toEqual(awsAccessKeyIdPlaceholder);
    expect(config.value().aws.secretAccessKey).toEqual(
      awsSecretAccessKeyPlaceholder,
    );
  });

  it('sets configuration values from environment variables', () => {
    process.env.HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID = 'theDufferBrothers';
    process.env.HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY = 'StrangerThings';
    process.env.HOMEBREW_CABOODLE_AWS_REGION = 'Eleven';
    process.env.HOMEBREW_CABOODLE_AWS_BUCKET_NAME = 'theUpsideDown';

    const c = new Config();
    expect(c.value().aws.accessKeyId).toEqual(
      process.env.HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID,
    );
  });

  it.each([
    ['region', 'eu-central-1', 'HOMEBREW_CABOODLE_AWS_REGION'],
    ['bucketName', 'homebrew-pc', 'HOMEBREW_CABOODLE_AWS_BUCKET_NAME'],
  ])(
    "defaults 'aws.%s' to '%s' when '%s' is undefined",
    (name: string, defaultValue: string) => {
      setEnvPlaceholders();
      const c = new Config();

      // @ts-expect-error: TS2345: Element implicitly has an 'any' type because expression of type ... can't be used to index type ...
      expect(c.value().aws[name]).toEqual(defaultValue);
    },
  );

  describe('value()', () => {
    it('throws an error when the configuration is invalid', () => {
      const c = new Config();

      expect(() => {
        c.value();
      }).toThrow();
    });

    it('throws an error with all issues when the configuration is invalid', () => {
      const c = new Config();

      const error = new RegExp(
        [
          '^.*?HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID.*? is required.*\n',
          '.*?HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY.*? is required.*$',
        ].join(''),
      );
      expect(() => {
        c.value();
      }).toThrow(error);
    });
  });

  describe('validate()', () => {
    it('throws an error when the configuration is invalid', () => {
      const c = new Config();

      expect(() => {
        c.validate();
      }).toThrow();
    });

    it('throws an error with all issues when the configuration is invalid', () => {
      const c = new Config();

      const error = new RegExp(
        [
          '^.*?HOMEBREW_CABOODLE_AWS_ACCESS_KEY_ID.*? is required.*\n',
          '.*?HOMEBREW_CABOODLE_AWS_SECRET_ACCESS_KEY.*? is required.*$',
        ].join(''),
      );

      expect(() => {
        c.validate();
      }).toThrow(error);
    });
  });
});
