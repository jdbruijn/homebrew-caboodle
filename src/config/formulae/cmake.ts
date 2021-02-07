import { Formula, Versions } from '../formula';

class CMake extends Formula {
  private _versions: Versions = new Set([
    '3.1.0',
    '3.1.1',
    '3.1.2',
    '3.1.3',
    '3.2.0',
    '3.2.1',
    '3.2.2',
    '3.2.3',
    '3.3.0',
    '3.3.1',
    '3.3.2',
    '3.4.0',
    '3.4.1',
    '3.4.2',
    '3.4.3',
    '3.5.0',
    '3.5.1',
    '3.5.2',
    '3.6.0',
    '3.6.1',
    '3.6.2',
    '3.6.3',
    '3.7.0',
    '3.7.1',
    '3.7.2',
    '3.8.0',
    '3.8.1',
    '3.8.2',
    '3.9.0',
    '3.9.1',
    '3.9.2',
    '3.9.3',
    '3.9.4',
    '3.9.5',
    '3.9.6',
    '3.10.0',
    '3.10.1',
    '3.10.2',
    '3.10.3',
    '3.11.0',
    '3.11.1',
    '3.11.2',
    '3.11.3',
    '3.11.4',
    '3.12.0',
    '3.12.1',
    '3.12.2',
    '3.12.3',
    '3.12.4',
    '3.13.0',
    '3.13.1',
    '3.13.2',
    '3.13.3',
    '3.13.4',
    '3.13.5',
    '3.14.0',
    '3.14.1',
    '3.14.2',
    '3.14.3',
    '3.14.4',
    '3.14.5',
    '3.14.6',
    '3.14.7',
    '3.15.0',
    '3.15.1',
    '3.15.2',
    '3.15.3',
    '3.15.4',
    '3.15.5',
  ]);

  constructor() {
    super('CMake', 'cmake', 'cmake-template.mustache', [
      'libcurl4-openssl-dev',
      'gcc',
    ]);
  }

  versions(): Versions {
    return this._versions;
  }

  url(version: string): string {
    this.validateVersion(version);

    return [
      'https://github.com/Kitware/CMake/releases/download/',
      `v${version}/cmake-${version}.tar.gz`,
    ].join('');
  }
}

export default CMake;
