const keyMirror = require('src/utils/keyMirror');

const Species = require('src/utils/Species');
const Jobs = require('src/utils/Backgrounds');

// prettier-ignore
const Keys = keyMirror({
  v26: true,
  v25: true,
  v24: true,
});

// Lookup version specific species and background metadata in crawl/crawl repo
const Versions = {
  // https://github.com/crawl/crawl/blob/0.26.1/crawl-ref/source/dat/species
  [Keys.v26]: '0.26',
  // https://github.com/crawl/crawl/tree/0.25.1/crawl-ref/source/dat/species
  [Keys.v25]: '0.25',
  // https://github.com/crawl/crawl/tree/0.24.1/crawl-ref/source/dat/species
  [Keys.v24]: '0.24',
};

const VersionSpecies = {
  [Versions.v26]: [
    Species.Ba,
    Species.DD,
    Species.DE,
    Species.Dg,
    Species.Ds,
    Species.Dr,
    Species.Fe,
    Species.Fo,
    Species.Gr,
    Species.Gh,
    Species.Gn,
    Species.Ha,
    Species.HO,
    Species.Hu,
    Species.Ko,
    Species.Mf,
    Species.Mi,
    Species.Mu,
    Species.Na,
    Species.Op,
    Species.Og,
    Species.Pa,
    Species.Sp,
    Species.Te,
    Species.Tr,
    Species.Vp,
    Species.VS,
  ],
  [Versions.v25]: [
    Species.Ba,
    Species.Ce,
    Species.DD,
    Species.DE,
    Species.Dg,
    Species.Ds,
    Species.Dr,
    Species.Fe,
    Species.Fo,
    Species.Gr,
    Species.Gh,
    Species.Gn,
    Species.Ha,
    Species.HO,
    Species.Hu,
    Species.Ko,
    Species.Mf,
    Species.Mi,
    Species.Mu,
    Species.Na,
    Species.Op,
    Species.Og,
    Species.Sp,
    Species.Te,
    Species.Tr,
    Species.Vp,
    Species.VS,
  ],
  [Versions.v24]: [
    Species.Ba,
    Species.Ce,
    Species.DD,
    Species.DE,
    Species.Dg,
    Species.Ds,
    Species.Dr,
    Species.Fe,
    Species.Fo,
    Species.Gr,
    Species.Gh,
    Species.Gn,
    Species.Ha,
    Species.HO,
    Species.Hu,
    Species.Ko,
    Species.Mf,
    Species.Mi,
    Species.Mu,
    Species.Na,
    Species.Op,
    Species.Og,
    Species.Sp,
    Species.Te,
    Species.Tr,
    Species.Vp,
    Species.VS,
  ],
};

const VersionBackgrounds = {
  [Versions.v26]: [
    Jobs.AE,
    Jobs.AK,
    Jobs.AM,
    Jobs.Ar,
    Jobs.Be,
    Jobs.Br,
    Jobs.Cj,
    Jobs.CK,
    Jobs.De,
    Jobs.EE,
    Jobs.En,
    Jobs.FE,
    Jobs.Fi,
    Jobs.Gl,
    Jobs.Hu,
    Jobs.IE,
    Jobs.Mo,
    Jobs.Ne,
    Jobs.Sk,
    Jobs.Su,
    Jobs.Tm,
    Jobs.VM,
    Jobs.Wn,
    Jobs.Wr,
    Jobs.Wz,
  ],
  [Versions.v25]: [
    Jobs.AE,
    Jobs.AK,
    Jobs.AM,
    Jobs.Ar,
    Jobs.As,
    Jobs.Be,
    Jobs.Cj,
    Jobs.CK,
    Jobs.EE,
    Jobs.En,
    Jobs.FE,
    Jobs.Fi,
    Jobs.Gl,
    Jobs.Hu,
    Jobs.IE,
    Jobs.Mo,
    Jobs.Ne,
    Jobs.Sk,
    Jobs.Su,
    Jobs.Tm,
    Jobs.VM,
    Jobs.Wn,
    Jobs.Wr,
    Jobs.Wz,
  ],
  [Versions.v24]: [
    Jobs.AE,
    Jobs.AK,
    Jobs.AM,
    Jobs.Ar,
    Jobs.As,
    Jobs.Be,
    Jobs.Cj,
    Jobs.CK,
    Jobs.EE,
    Jobs.En,
    Jobs.FE,
    Jobs.Fi,
    Jobs.Gl,
    Jobs.Hu,
    Jobs.IE,
    Jobs.Mo,
    Jobs.Ne,
    Jobs.Sk,
    Jobs.Su,
    Jobs.Tm,
    Jobs.VM,
    Jobs.Wn,
    Jobs.Wr,
    Jobs.Wz,
  ],
};

// See _banned_combination
// https://github.com/crawl/crawl/blob/master/crawl-ref/source/ng-restr.cc
const VersionBannedCombosBackgrounds = {
  [Versions.v26]: {
    [Species.Fe]: { [Jobs.Gl]: true, [Jobs.Br]: true, [Jobs.Hu]: true, [Jobs.AM]: true },
    [Species.Dg]: { [Jobs.Be]: true, [Jobs.CK]: true, [Jobs.AK]: true, [Jobs.Mo]: true },
  },
  [Versions.v25]: {
    [Species.Fe]: { [Jobs.Gl]: true, [Jobs.As]: true, [Jobs.Hu]: true, [Jobs.AM]: true },
    [Species.Dg]: { [Jobs.Be]: true, [Jobs.CK]: true, [Jobs.AK]: true, [Jobs.Mo]: true },
  },
  [Versions.v24]: {
    [Species.Fe]: { [Jobs.Gl]: true, [Jobs.As]: true, [Jobs.Hu]: true, [Jobs.AM]: true },
    [Species.Dg]: { [Jobs.Be]: true, [Jobs.CK]: true, [Jobs.AK]: true, [Jobs.Mo]: true },
  },
};

// Generate lookup for consistent lookup behavior with VersionBannedCombosBackgrounds
const VersionBannedCombosSpecies = Object.keys(VersionBannedCombosBackgrounds).reduce((vbcb, version) => {
  // Species => Backgrounds
  const vbcsp = VersionBannedCombosBackgrounds[version];

  // Species => Backgrounds lookup (what we are building)
  const bgSpLookup = {};

  // For each species in Species => Backgrounds
  Object.keys(vbcsp).forEach((sp) => {
    const bgs = Object.keys(vbcsp[sp]);
    bgs.forEach((bg) => {
      if (!bgSpLookup[bg]) bgSpLookup[bg] = {};
      bgSpLookup[bg][sp] = true;
    });
  });

  // Initialize dictionary for this version
  vbcb[version] = bgSpLookup;

  // return the entire VersionRecommendedBackgrounds lookup
  return vbcb;
}, {});

const BaseVersionRecommendedBackgrounds = {
  [Versions.v26]: {
    [Species.Ba]: [Jobs.Fi, Jobs.Be, Jobs.Su, Jobs.IE],
    [Species.DD]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.Ne, Jobs.EE],
    [Species.DE]: [Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Dg]: [Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE],
    [Species.Ds]: [Jobs.Gl, Jobs.Be, Jobs.AK, Jobs.Wz, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.VM],
    [Species.Dr]: [Jobs.Be, Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Fe]: [Jobs.Be, Jobs.En, Jobs.Tm, Jobs.IE, Jobs.AE, Jobs.Cj, Jobs.Su, Jobs.VM],
    [Species.Fo]: [Jobs.Fi, Jobs.Hu, Jobs.AK, Jobs.AM, Jobs.EE, Jobs.VM],
    [Species.Gr]: [Jobs.Fi, Jobs.Gl, Jobs.Mo, Jobs.Be, Jobs.FE, Jobs.IE, Jobs.EE, Jobs.VM],
    [Species.Gh]: [Jobs.Wr, Jobs.Gl, Jobs.Mo, Jobs.Ne, Jobs.IE, Jobs.EE],
    [Species.Gn]: [Jobs.Wr, Jobs.AM, Jobs.Tm, Jobs.Wn],
    [Species.Ha]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.AK],
    [Species.HO]: [Jobs.Fi, Jobs.Mo, Jobs.Be, Jobs.AK, Jobs.Ne, Jobs.FE],
    [Species.Hu]: [Jobs.Be, Jobs.Cj, Jobs.Ne, Jobs.FE, Jobs.IE],
    [Species.Ko]: [Jobs.Hu, Jobs.Be, Jobs.AM, Jobs.En, Jobs.Cj, Jobs.Su],
    [Species.Mf]: [Jobs.Gl, Jobs.Be, Jobs.Tm, Jobs.Su, Jobs.IE, Jobs.VM],
    [Species.Mi]: [Jobs.Fi, Jobs.Gl, Jobs.Mo, Jobs.Hu, Jobs.Be, Jobs.AK],
    [Species.Mu]: [Jobs.Wz, Jobs.Cj, Jobs.Ne, Jobs.IE, Jobs.FE, Jobs.Su],
    [Species.Na]: [Jobs.Be, Jobs.Tm, Jobs.En, Jobs.FE, Jobs.IE, Jobs.Wr, Jobs.Wz, Jobs.VM],
    [Species.Op]: [Jobs.Tm, Jobs.Wz, Jobs.Cj, Jobs.Br, Jobs.FE, Jobs.EE, Jobs.VM],
    [Species.Og]: [Jobs.Hu, Jobs.Be, Jobs.AM, Jobs.Wz, Jobs.FE],
    [Species.Pa]: [Jobs.Fi, Jobs.Be, Jobs.AK, Jobs.Wr, Jobs.Wz],
    [Species.Sp]: [Jobs.Br, Jobs.Ar, Jobs.AK, Jobs.Wr, Jobs.En, Jobs.Cj, Jobs.EE, Jobs.VM],
    [Species.Te]: [Jobs.Be, Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.FE, Jobs.AE, Jobs.VM],
    [Species.Tr]: [Jobs.Fi, Jobs.Mo, Jobs.Hu, Jobs.Be, Jobs.Wr, Jobs.EE, Jobs.Wz],
    [Species.Vp]: [Jobs.Gl, Jobs.Br, Jobs.En, Jobs.Ne, Jobs.EE, Jobs.IE],
    [Species.VS]: [Jobs.Fi, Jobs.Br, Jobs.Be, Jobs.En, Jobs.Cj, Jobs.Ne, Jobs.IE],
  },
  [Versions.v25]: {
    [Species.Ba]: [Jobs.Fi, Jobs.Be, Jobs.Su, Jobs.IE],
    [Species.Ce]: [Jobs.Fi, Jobs.Gl, Jobs.Hu, Jobs.Wr, Jobs.AM],
    [Species.DD]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.Ne, Jobs.EE],
    [Species.DE]: [Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Dg]: [Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE],
    [Species.Ds]: [Jobs.Gl, Jobs.Be, Jobs.AK, Jobs.Wz, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.VM],
    [Species.Dr]: [Jobs.Be, Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Fe]: [Jobs.Be, Jobs.En, Jobs.Tm, Jobs.IE, Jobs.AE, Jobs.Cj, Jobs.Su, Jobs.VM],
    [Species.Fo]: [Jobs.Fi, Jobs.Hu, Jobs.AK, Jobs.AM, Jobs.EE, Jobs.VM],
    [Species.Gr]: [Jobs.Fi, Jobs.Gl, Jobs.Mo, Jobs.Be, Jobs.FE, Jobs.IE, Jobs.EE, Jobs.VM],
    [Species.Gh]: [Jobs.Wr, Jobs.Gl, Jobs.Mo, Jobs.Ne, Jobs.IE, Jobs.EE],
    [Species.Gn]: [Jobs.Wr, Jobs.AM, Jobs.Tm, Jobs.Wn],
    [Species.Ha]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.AK],
    [Species.HO]: [Jobs.Fi, Jobs.Mo, Jobs.Be, Jobs.AK, Jobs.Ne, Jobs.FE],
    [Species.Hu]: [Jobs.Be, Jobs.Cj, Jobs.Ne, Jobs.FE, Jobs.IE],
    [Species.Ko]: [Jobs.Hu, Jobs.Be, Jobs.AM, Jobs.En, Jobs.Cj, Jobs.Su],
    [Species.Mf]: [Jobs.Gl, Jobs.Be, Jobs.Tm, Jobs.Su, Jobs.IE, Jobs.VM],
    [Species.Mi]: [Jobs.Fi, Jobs.Gl, Jobs.Mo, Jobs.Hu, Jobs.Be, Jobs.AK],
    [Species.Mu]: [Jobs.Wz, Jobs.Cj, Jobs.Ne, Jobs.IE, Jobs.FE, Jobs.Su],
    [Species.Na]: [Jobs.Be, Jobs.Tm, Jobs.En, Jobs.FE, Jobs.IE, Jobs.Wr, Jobs.Wz, Jobs.VM],
    [Species.Op]: [Jobs.Tm, Jobs.Wz, Jobs.Cj, Jobs.As, Jobs.FE, Jobs.EE, Jobs.VM],
    [Species.Og]: [Jobs.Hu, Jobs.Be, Jobs.AM, Jobs.Wz, Jobs.FE],
    [Species.Sp]: [Jobs.As, Jobs.Ar, Jobs.AK, Jobs.Wr, Jobs.En, Jobs.Cj, Jobs.EE, Jobs.VM],
    [Species.Te]: [Jobs.Be, Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.FE, Jobs.AE, Jobs.VM],
    [Species.Tr]: [Jobs.Fi, Jobs.Mo, Jobs.Hu, Jobs.Be, Jobs.Wr, Jobs.EE, Jobs.Wz],
    [Species.Vp]: [Jobs.Gl, Jobs.As, Jobs.En, Jobs.Ne, Jobs.EE, Jobs.IE],
    [Species.VS]: [Jobs.Fi, Jobs.As, Jobs.Be, Jobs.En, Jobs.Cj, Jobs.Ne, Jobs.IE],
  },
  [Versions.v24]: {
    [Species.Ba]: [Jobs.Fi, Jobs.Be, Jobs.Su, Jobs.IE],
    [Species.Ce]: [Jobs.Fi, Jobs.Gl, Jobs.Hu, Jobs.Wr, Jobs.AM],
    [Species.DD]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.Ne, Jobs.EE],
    [Species.DE]: [Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Dg]: [Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE],
    [Species.Ds]: [Jobs.Gl, Jobs.Be, Jobs.AK, Jobs.Wz, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.VM],
    [Species.Dr]: [Jobs.Be, Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Fe]: [Jobs.Be, Jobs.En, Jobs.Tm, Jobs.IE, Jobs.AE, Jobs.Cj, Jobs.Su, Jobs.VM],
    [Species.Fo]: [Jobs.Fi, Jobs.Hu, Jobs.AK, Jobs.AM, Jobs.EE, Jobs.VM],
    [Species.Gr]: [Jobs.Fi, Jobs.Gl, Jobs.Mo, Jobs.Be, Jobs.FE, Jobs.IE, Jobs.EE, Jobs.VM],
    [Species.Gh]: [Jobs.Wr, Jobs.Gl, Jobs.Mo, Jobs.Ne, Jobs.IE, Jobs.EE],
    [Species.Gn]: [Jobs.Wr, Jobs.AM, Jobs.Tm, Jobs.Wn],
    [Species.Ha]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.AK],
    [Species.HO]: [Jobs.Fi, Jobs.Mo, Jobs.Be, Jobs.AK, Jobs.Ne, Jobs.FE],
    [Species.Hu]: [Jobs.Be, Jobs.Cj, Jobs.Ne, Jobs.FE, Jobs.IE],
    [Species.Ko]: [Jobs.Hu, Jobs.Be, Jobs.AM, Jobs.En, Jobs.Cj, Jobs.Su],
    [Species.Mf]: [Jobs.Gl, Jobs.Be, Jobs.Tm, Jobs.Su, Jobs.IE, Jobs.VM],
    [Species.Mi]: [Jobs.Fi, Jobs.Gl, Jobs.Mo, Jobs.Hu, Jobs.Be, Jobs.AK],
    [Species.Mu]: [Jobs.Wz, Jobs.Cj, Jobs.Ne, Jobs.IE, Jobs.FE, Jobs.Su],
    [Species.Na]: [Jobs.Be, Jobs.Tm, Jobs.En, Jobs.FE, Jobs.IE, Jobs.Wr, Jobs.Wz, Jobs.VM],
    [Species.Op]: [Jobs.Tm, Jobs.Wz, Jobs.Cj, Jobs.As, Jobs.FE, Jobs.EE, Jobs.VM],
    [Species.Og]: [Jobs.Hu, Jobs.Be, Jobs.AM, Jobs.Wz, Jobs.FE],
    [Species.Sp]: [Jobs.As, Jobs.Ar, Jobs.AK, Jobs.Wr, Jobs.En, Jobs.Cj, Jobs.EE, Jobs.VM],
    [Species.Te]: [Jobs.Be, Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.FE, Jobs.AE, Jobs.VM],
    [Species.Tr]: [Jobs.Fi, Jobs.Mo, Jobs.Hu, Jobs.Be, Jobs.Wr, Jobs.EE, Jobs.Wz],
    [Species.Vp]: [Jobs.Gl, Jobs.As, Jobs.En, Jobs.Ne, Jobs.EE, Jobs.IE],
    [Species.VS]: [Jobs.Fi, Jobs.As, Jobs.Be, Jobs.En, Jobs.Cj, Jobs.Ne, Jobs.IE],
  },
};

// Generate lookup from BaseVersionRecommendedBackgrounds
// Basically converts array into dictionary for consistent lookup behavior with VersionRecommendedSpecies
const VersionRecommendedBackgrounds = Object.keys(BaseVersionRecommendedBackgrounds).reduce((vrb, version) => {
  // Species => Backgrounds
  const spBgs = BaseVersionRecommendedBackgrounds[version];

  // Species => Backgrounds lookup (what we are building)
  const spBgsLookup = {};

  // Ensure every species exists in lookup
  VersionSpecies[version].forEach((sp) => {
    if (!spBgsLookup[sp]) spBgsLookup[sp] = {};
  });

  // For each species in Species => Backgrounds
  Object.keys(spBgs).forEach((sp) => {
    const bgs = spBgs[sp];
    bgs.forEach((bg) => {
      spBgsLookup[sp][bg] = true;
    });
  });

  // Initialize dictionary for this version
  vrb[version] = spBgsLookup;

  // return the entire VersionRecommendedBackgrounds lookup
  return vrb;
}, {});

// Build Recommended Background => Species from Species => Backgrounds
const VersionRecommendedSpecies = Object.keys(BaseVersionRecommendedBackgrounds).reduce((vrs, version) => {
  // Species => Backgrounds
  const spBgs = BaseVersionRecommendedBackgrounds[version];

  // Backgrounds => Species lookup (what we are building)
  const bgSps = {};

  // Ensure every background exists in lookup
  VersionBackgrounds[version].forEach((bg) => {
    if (!bgSps[bg]) bgSps[bg] = {};
  });

  // For each species in Species => Backgrounds
  Object.keys(spBgs).forEach((sp) => {
    const bgs = spBgs[sp];
    bgs.forEach((bg) => {
      if (!bgSps[bg]) bgSps[bg] = {};
      bgSps[bg][sp] = true;
    });
  });

  // Initialize dictionary for this version
  vrs[version] = bgSps;

  // return the entire VersionRecommendedSpecies lookup
  return vrs;
}, {});

const SpeciesBackgrounds = {
  Species: VersionSpecies,
  Backgrounds: VersionBackgrounds,
};

const Recommended = {
  Species: VersionRecommendedSpecies,
  Backgrounds: VersionRecommendedBackgrounds,
};

const BannedCombos = {
  Species: VersionBannedCombosSpecies,
  Backgrounds: VersionBannedCombosBackgrounds,
};

module.exports = {
  ...Versions,
  Keys: Versions,
  Recommended,
  getSpecies: ({ version, background }) => getType('Species', version, background),
  getBackgrounds: ({ version, species }) => getType('Backgrounds', version, species),
};

function getType(type, version, other) {
  const values = Object.values(SpeciesBackgrounds[type][version]);

  if (other) {
    // do banned combos exist for the other selection?
    // e.g. when `type` is 'Background', `other` should be the species, e.g. 'Dg'
    // e.g. when `type` is 'Species', `other` should be the background, e.g. 'CK'
    const bannedCombos = BannedCombos[type][version][other];

    if (bannedCombos) {
      // yes? filter out banned combos
      // e.g. felid weapon backgrounds like gladiator, hunter, etc.
      // e.g. demigod god backgrounds like chaos knight, monk, etc.
      const filteredValues = values.filter((v) => !bannedCombos[v]);
      return filteredValues;
    }
  }

  return values;
}
