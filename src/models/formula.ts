interface Bottle {
  root_url?: string;
  cellar?: string;
  macOs?: {
    bigSur?: string;
    catalina?: string;
    mojave?: string;
    highSierra?: string;
    sierra?: string;
    elCapitan?: string;
    yosemite?: string;
    mavericks?: string;
  };
  linux?: string;
}

interface Formula {
  config: string; // ArmNoneEabiGcc | CMake

  name: string;
  url: string;
  sha256: string;
  version: string;
  kegOnly: string;
  bottle?: Bottle | 'unneeded';
}

export default Formula;
export { Bottle, Formula };
