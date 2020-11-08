interface Aws {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

interface Config {
  aws: Aws;
}

export default Config;
export { Aws, Config };
