const keyMirror = require('src/utils/keyMirror');

const Version = keyMirror({
  v29: true,
  v28: true,
  v27: true,
  v26: true,
  v25: true,
  v24: true,
});

// Lookup version specific species and background metadata in crawl/crawl repo
// https://github.com/crawl/crawl/tree/0.29.0/crawl-ref/source/dat/species
// https://github.com/crawl/crawl/tree/0.29.0/crawl-ref/source/job-data.h
// _banned_combination (BannedCombos)
// https://github.com/crawl/crawl/blob/0.28.0/crawl-ref/source/ng-restr.cc
//
// Consider using parser to programmatically get jobs, species, recommended etc.
const VersionMeta = {
  [Version.v29]: require('./0.29'),
  [Version.v28]: require('./0.28'),
  [Version.v27]: require('./0.27'),
  [Version.v26]: require('./0.26'),
  [Version.v25]: require('./0.25'),
  [Version.v24]: require('./0.24'),
};

const SpeciesBackgrounds = {
  Species: {},
  Backgrounds: {},
};

const Recommended = {
  Species: {},
  Backgrounds: {},
};

const BannedCombos = {
  Species: {},
  Backgrounds: {},
};

for (const version of Object.keys(Version)) {
  const version_meta = VersionMeta[version];

  SpeciesBackgrounds.Species[version] = version_meta.Species;
  SpeciesBackgrounds.Backgrounds[version] = version_meta.Backgrounds;

  Recommended.Species[version] = buildConvertedLookup(version_meta.RecommendedSpecies);
  Recommended.Backgrounds[version] = buildConvertedLookup(version_meta.RecommendedBackgrounds);

  BannedCombos.Backgrounds[version] = version_meta.BannedCombos;

  // reverse into Background to Species lookup (BannedCombos.Species)
  BannedCombos.Species[version] = {};

  for (const species of Object.keys(BannedCombos.Backgrounds[version])) {
    for (const background of Object.keys(BannedCombos.Backgrounds[version][species])) {
      if (!BannedCombos.Species[version][background]) {
        BannedCombos.Species[version][background] = {};
      }

      BannedCombos.Species[version][background][species] = true;
    }
  }
}

module.exports = {
  ...Version,
  Enum: Version,
  Recommended,
  getSpecies: ({ version, background }, options) => getType('Species', version, background, options),
  getBackgrounds: ({ version, species }, options) => getType('Backgrounds', version, species, options),
};

function getType(type, version, other, options = {}) {
  const speciesBackgrounds = SpeciesBackgrounds[type];
  if (!speciesBackgrounds) throw new Error(`SpeciesBackgrounds missing type [${type}]`);

  const speciesBackgroundsVersion = speciesBackgrounds[version];
  if (!speciesBackgroundsVersion) throw new Error(`SpeciesBackgrounds missing type [${type}] for version [${version}]`);

  const values = Object.values(speciesBackgroundsVersion);

  return values.map((value) => {
    let banned;

    if (other) {
      // do banned combos exist for the other selection?
      // e.g. when `type` is 'Background', `other` should be the species, e.g. 'Dg'
      // e.g. when `type` is 'Species', `other` should be the background, e.g. 'CK'
      const bannedCombosVersion = BannedCombos[type][version];
      if (!bannedCombosVersion) throw new Error(`BannedCombos missing type [${type}] for version [${version}]`);

      const bannedCombos = BannedCombos[type][version][other];
      if (bannedCombos) {
        banned = bannedCombos[value];
      }
    }

    return { value, banned };
  });
}

// Generate lookup from [value]: ['a', 'b']
// e.g. [value]: {a: true, b: true, };
// Basically converts array into dictionary for consistent lookup behavior
function buildConvertedLookup(baseLookup) {
  const convertedLookup = {};

  Object.keys(baseLookup).forEach((key) => {
    if (!convertedLookup[key]) convertedLookup[key] = {};
    const values = baseLookup[key];
    values.forEach((value) => {
      convertedLookup[key][value] = true;
    });
  });

  return convertedLookup;
}
