import Formula from '../formula';

interface Version {
  release: string;
  version: string;
  architecture: string;
}

class ArmNoneEabiGcc extends Formula {
  private readonly _versions: ReadonlyMap<string, Version> = new Map([
    [
      '7.2.1',
      {
        release: '7-2017q4',
        version: '7-2017-q4-major',
        architecture: 'linux',
      },
    ],
    [
      '9.3.1',
      {
        release: '9-2020q2',
        version: '9-2020-q2-update',
        architecture: 'x86_64-linux',
      },
    ],
  ]);

  constructor() {
    super(
      'GNU Arm Embedded Toolchain',
      'arm-none-eabi-gcc',
      'arm-none-eabi-gcc.mustache',
    );
  }

  versions(): ReadonlySet<string> {
    return [...this._versions.keys()];
  }

  url(version: string): string {
    this.validateVersion(version);

    const v = this._versions.get(version);
    if (!v) {
      throw new Error(`Version '${version}' not in 'versions()'`);
    }

    return [
      'https://developer.arm.com/-/media/Files/downloads/gnu-rm/',
      `${v.release}/gcc-arm-none-eabi-${v.version}-${v.architecture}.tar.bz2`,
    ].join('');
  }
}

export default ArmNoneEabiGcc;
