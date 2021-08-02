const keyMirror = require('src/utils/keyMirror');

const Species = require('src/utils/Species');
const Jobs = require('src/utils/Backgrounds');

// prettier-ignore
const Keys = keyMirror({
  v27: true,
  v26: true,
  v25: true,
  v24: true,
});

// Lookup version specific species and background metadata in crawl/crawl repo
const Versions = {
  // https://github.com/crawl/crawl/blob/0.27.0/crawl-ref/source/dat/species
  [Keys.v27]: '0.27',
  // https://github.com/crawl/crawl/blob/0.26.1/crawl-ref/source/dat/species
  [Keys.v26]: '0.26',
  // https://github.com/crawl/crawl/tree/0.25.1/crawl-ref/source/dat/species
  [Keys.v25]: '0.25',
  // https://github.com/crawl/crawl/tree/0.24.1/crawl-ref/source/dat/species
  [Keys.v24]: '0.24',
};

const VersionSpecies = {
  [Versions.v27]: [
    Species.Ba,
    Species.DD,
    Species.DE,
    Species.Dg,
    Species.Dj,
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
  [Versions.v27]: [
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
    Jobs.Su,
    Jobs.Tm,
    Jobs.VM,
    Jobs.Wn,
    Jobs.Wr,
    Jobs.Wz,
  ],
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

const VersionRecommendedBackgrounds = buildConvertedLookup({
  // https://github.com/crawl/crawl/blob/0.27.0/crawl-ref/source/dat/species
  [Versions.v27]: {
    [Species.Ba]: [Jobs.Fi, Jobs.Be, Jobs.Su, Jobs.IE],
    [Species.DD]: [Jobs.Fi, Jobs.Hu, Jobs.Be, Jobs.Ne, Jobs.EE],
    [Species.DE]: [Jobs.Wz, Jobs.Cj, Jobs.Su, Jobs.Ne, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE, Jobs.VM],
    [Species.Dg]: [Jobs.Tm, Jobs.Cj, Jobs.FE, Jobs.IE, Jobs.AE, Jobs.EE],
    [Species.Dj]: [Jobs.Gl, Jobs.Tm, Jobs.Wz, Jobs.FE, Jobs.IE],
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
});

// Job data defining recommended species for backgrounds (jobs)
const VersionRecommendedSpecies = buildConvertedLookup({
  // https://github.com/crawl/crawl/blob/0.27.0/crawl-ref/source/job-data.h
  [Versions.v27]: {
    [Jobs.AE]: [Species.DE, Species.Dj, Species.Te, Species.Dr, Species.Na, Species.VS],
    [Jobs.AK]: [Species.HO, Species.Pa, Species.Tr, Species.Mf, Species.Dr, Species.Ds],
    [Jobs.AM]: [Species.Fo, Species.DE, Species.Ko, Species.Sp, Species.Tr],
    [Jobs.Ar]: [Species.DD, Species.Ha, Species.Ko, Species.Sp, Species.Dr, Species.Ds],
    [Jobs.Be]: [Species.HO, Species.Ha, Species.Og, Species.Mf, Species.Mi, Species.Gr, Species.Pa],
    [Jobs.Br]: [Species.Tr, Species.Ha, Species.Sp, Species.Ds, Species.Vp, Species.VS],
    [Jobs.Cj]: [Species.DE, Species.Dj, Species.Na, Species.Te, Species.Dr, Species.Dg],
    [Jobs.CK]: [Species.HO, Species.Tr, Species.Gn, Species.Mf, Species.Mi, Species.Dr, Species.Ds],
    [Jobs.De]: [Species.Fe, Species.Sp, Species.Ko, Species.Vp],
    [Jobs.EE]: [Species.DE, Species.DD, Species.Sp, Species.Gr, Species.Dg, Species.Gh, Species.Op],
    [Jobs.En]: [Species.DE, Species.Fe, Species.Ko, Species.Sp, Species.Na, Species.Vp],
    [Jobs.FE]: [Species.DE, Species.Dj, Species.HO, Species.Na, Species.Te, Species.Dg, Species.Gr],
    [Jobs.Fi]: [Species.DD, Species.HO, Species.Tr, Species.Mi, Species.Gr, Species.Pa],
    [Jobs.Gl]: [Species.DD, Species.HO, Species.Mf, Species.Mi, Species.Gr, Species.Gn],
    [Jobs.Hu]: [Species.HO, Species.Ha, Species.Ko, Species.Og, Species.Tr],
    [Jobs.IE]: [Species.DE, Species.Dj, Species.Mf, Species.Na, Species.Dr, Species.Dg, Species.Gr],
    [Jobs.Mo]: [Species.DD, Species.HO, Species.Tr, Species.Pa, Species.Mf, Species.Gr, Species.Ds],
    [Jobs.Ne]: [Species.DE, Species.DD, Species.HO, Species.Ds, Species.Mu, Species.Vp],
    [Jobs.Su]: [Species.DE, Species.HO, Species.VS, Species.Mf, Species.Te, Species.Vp],
    [Jobs.Tm]: [Species.Na, Species.Mf, Species.Dr, Species.Dg, Species.Ds, Species.Tr],
    [Jobs.VM]: [Species.DE, Species.Dj, Species.Sp, Species.Na, Species.Mf, Species.Te, Species.Fe, Species.Ds],
    [Jobs.Wn]: [Species.HO, Species.Sp, Species.Gn, Species.Mf, Species.Dr, Species.Hu, Species.Ds],
    [Jobs.Wr]: [Species.Fe, Species.Ha, Species.DD, Species.Sp, Species.Pa, Species.Dr],
    [Jobs.Wz]: [Species.DE, Species.Dj, Species.Na, Species.Dr, Species.Op, Species.Hu, Species.Mu],
  },
  // https://github.com/crawl/crawl/blob/0.26.1/crawl-ref/source/job-data.h
  [Versions.v26]: {
    [Jobs.AE]: [Species.DE, Species.Te, Species.Dr, Species.Na, Species.VS],
    [Jobs.AK]: [Species.HO, Species.Pa, Species.Tr, Species.Mf, Species.Dr, Species.Ds],
    [Jobs.AM]: [Species.Fo, Species.DE, Species.Ko, Species.Sp, Species.Tr],
    [Jobs.Ar]: [Species.DD, Species.Ha, Species.Ko, Species.Sp, Species.Dr, Species.Ds],
    [Jobs.Be]: [Species.HO, Species.Ha, Species.Og, Species.Mf, Species.Mi, Species.Gr, Species.Pa],
    [Jobs.Br]: [Species.Tr, Species.Ha, Species.Sp, Species.Ds, Species.Vp, Species.VS],
    [Jobs.Cj]: [Species.DE, Species.Na, Species.Te, Species.Dr, Species.Dg],
    [Jobs.CK]: [Species.HO, Species.Tr, Species.Gn, Species.Mf, Species.Mi, Species.Dr, Species.Ds],
    [Jobs.De]: [Species.Fe, Species.Sp, Species.Ko, Species.Vp],
    [Jobs.EE]: [Species.DE, Species.DD, Species.Sp, Species.Gr, Species.Dg, Species.Gh, Species.Op],
    [Jobs.En]: [Species.DE, Species.Fe, Species.Ko, Species.Sp, Species.Na, Species.Vp],
    [Jobs.FE]: [Species.DE, Species.HO, Species.Na, Species.Te, Species.Dg, Species.Gr],
    [Jobs.Fi]: [Species.DD, Species.HO, Species.Tr, Species.Mi, Species.Gr, Species.Pa],
    [Jobs.Gl]: [Species.DD, Species.HO, Species.Mf, Species.Mi, Species.Gr, Species.Gn],
    [Jobs.Hu]: [Species.HO, Species.Ha, Species.Ko, Species.Og, Species.Tr],
    [Jobs.IE]: [Species.DE, Species.Mf, Species.Na, Species.Dr, Species.Dg, Species.Gr],
    [Jobs.Mo]: [Species.DD, Species.HO, Species.Tr, Species.Pa, Species.Mf, Species.Gr, Species.Ds],
    [Jobs.Ne]: [Species.DE, Species.DD, Species.HO, Species.Ds, Species.Mu, Species.Vp],
    [Jobs.Su]: [Species.DE, Species.HO, Species.VS, Species.Mf, Species.Te, Species.Vp],
    [Jobs.Tm]: [Species.Na, Species.Mf, Species.Dr, Species.Dg, Species.Ds, Species.Tr],
    [Jobs.VM]: [Species.DE, Species.Sp, Species.Na, Species.Mf, Species.Te, Species.Fe, Species.Ds],
    [Jobs.Wn]: [Species.HO, Species.Sp, Species.Gn, Species.Mf, Species.Dr, Species.Hu, Species.Ds],
    [Jobs.Wr]: [Species.Fe, Species.Ha, Species.DD, Species.Sp, Species.Pa, Species.Dr],
    [Jobs.Wz]: [Species.DE, Species.Na, Species.Dr, Species.Op, Species.Hu, Species.Mu],
  },
  // https://github.com/crawl/crawl/blob/0.25.1/crawl-ref/source/job-data.h
  [Versions.v25]: {
    [Jobs.AE]: [Species.DE, Species.Te, Species.Dr, Species.Na, Species.VS],
    [Jobs.AK]: [Species.HO, Species.Sp, Species.Tr, Species.Mf, Species.Dr, Species.Ds],
    [Jobs.AM]: [Species.Fo, Species.DE, Species.Ko, Species.Sp, Species.Tr, Species.Ce],
    [Jobs.Ar]: [Species.DD, Species.Ha, Species.Ko, Species.Sp, Species.Dr, Species.Ds],
    [Jobs.As]: [Species.Tr, Species.Ha, Species.Sp, Species.Ds, Species.Vp, Species.VS],
    [Jobs.Be]: [Species.HO, Species.Ha, Species.Og, Species.Mf, Species.Mi, Species.Gr, Species.Ds],
    [Jobs.Cj]: [Species.DE, Species.Na, Species.Te, Species.Dr, Species.Dg],
    [Jobs.CK]: [Species.HO, Species.Tr, Species.Ce, Species.Mf, Species.Mi, Species.Dr, Species.Ds],
    [Jobs.EE]: [Species.DE, Species.DD, Species.Sp, Species.Gr, Species.Dg, Species.Gh, Species.Op],
    [Jobs.En]: [Species.DE, Species.Fe, Species.Ko, Species.Sp, Species.Na, Species.Vp],
    [Jobs.FE]: [Species.DE, Species.HO, Species.Na, Species.Te, Species.Dg, Species.Gr],
    [Jobs.Fi]: [Species.DD, Species.HO, Species.Tr, Species.Mi, Species.Gr, Species.Ce],
    [Jobs.Gl]: [Species.DD, Species.HO, Species.Mf, Species.Mi, Species.Gr, Species.Ce],
    [Jobs.Hu]: [Species.HO, Species.Ha, Species.Ko, Species.Og, Species.Tr, Species.Ce],
    [Jobs.IE]: [Species.DE, Species.Mf, Species.Na, Species.Dr, Species.Dg, Species.Gr],
    [Jobs.Mo]: [Species.DD, Species.HO, Species.Tr, Species.Ce, Species.Mf, Species.Gr, Species.Ds],
    [Jobs.Ne]: [Species.DE, Species.DD, Species.HO, Species.Ds, Species.Mu, Species.Vp],
    [Jobs.Sk]: [Species.Ha, Species.Ce, Species.Mf, Species.Dr, Species.Vp],
    [Jobs.Su]: [Species.DE, Species.HO, Species.VS, Species.Mf, Species.Te, Species.Vp],
    [Jobs.Tm]: [Species.Na, Species.Mf, Species.Dr, Species.Dg, Species.Ds, Species.Tr],
    [Jobs.VM]: [Species.DE, Species.Sp, Species.Na, Species.Mf, Species.Te, Species.Fe, Species.Ds],
    [Jobs.Wn]: [Species.HO, Species.Sp, Species.Ce, Species.Mf, Species.Dr, Species.Hu, Species.Ds],
    [Jobs.Wr]: [Species.Fe, Species.Ha, Species.DD, Species.Sp, Species.Ce, Species.Dr],
    [Jobs.Wz]: [Species.DE, Species.Na, Species.Dr, Species.Op, Species.Hu, Species.Mu],
  },
  // https://github.com/crawl/crawl/blob/0.24.1/crawl-ref/source/job-data.h
  [Versions.v24]: {
    [Jobs.AE]: [Species.DE, Species.Te, Species.Dr, Species.Na, Species.VS],
    [Jobs.AK]: [Species.HO, Species.Sp, Species.Tr, Species.Mf, Species.Dr, Species.Ds],
    [Jobs.AM]: [Species.Fo, Species.DE, Species.Ko, Species.Sp, Species.Tr, Species.Ce],
    [Jobs.Ar]: [Species.DD, Species.Ha, Species.Ko, Species.Sp, Species.Dr, Species.Ds],
    [Jobs.As]: [Species.Tr, Species.Ha, Species.Sp, Species.Ds, Species.Vp, Species.VS],
    [Jobs.Be]: [Species.HO, Species.Ha, Species.Og, Species.Mf, Species.Mi, Species.Gr, Species.Ds],
    [Jobs.Cj]: [Species.DE, Species.Na, Species.Te, Species.Dr, Species.Dg],
    [Jobs.CK]: [Species.HO, Species.Tr, Species.Ce, Species.Mf, Species.Mi, Species.Dr, Species.Ds],
    [Jobs.EE]: [Species.DE, Species.DD, Species.Sp, Species.Gr, Species.Dg, Species.Gh, Species.Op],
    [Jobs.En]: [Species.DE, Species.Fe, Species.Ko, Species.Sp, Species.Na, Species.Vp],
    [Jobs.FE]: [Species.DE, Species.HO, Species.Na, Species.Te, Species.Dg, Species.Gr],
    [Jobs.Fi]: [Species.DD, Species.HO, Species.Tr, Species.Mi, Species.Gr, Species.Ce],
    [Jobs.Gl]: [Species.DD, Species.HO, Species.Mf, Species.Mi, Species.Gr, Species.Ce],
    [Jobs.Hu]: [Species.HO, Species.Ha, Species.Ko, Species.Og, Species.Tr, Species.Ce],
    [Jobs.IE]: [Species.DE, Species.Mf, Species.Na, Species.Dr, Species.Dg, Species.Gr],
    [Jobs.Mo]: [Species.DD, Species.HO, Species.Tr, Species.Ce, Species.Mf, Species.Gr, Species.Ds],
    [Jobs.Ne]: [Species.DE, Species.DD, Species.HO, Species.Ds, Species.Mu, Species.Vp],
    [Jobs.Sk]: [Species.Ha, Species.Ce, Species.Mf, Species.Dr, Species.Vp],
    [Jobs.Su]: [Species.DE, Species.HO, Species.VS, Species.Mf, Species.Te, Species.Vp],
    [Jobs.Tm]: [Species.Na, Species.Mf, Species.Dr, Species.Dg, Species.Ds, Species.Tr],
    [Jobs.VM]: [Species.DE, Species.Sp, Species.Na, Species.Mf, Species.Te, Species.Fe, Species.Ds],
    [Jobs.Wn]: [Species.HO, Species.Sp, Species.Ce, Species.Mf, Species.Dr, Species.Hu, Species.Ds],
    [Jobs.Wr]: [Species.Fe, Species.Ha, Species.DD, Species.Sp, Species.Ce, Species.Dr],
    [Jobs.Wz]: [Species.DE, Species.Na, Species.Dr, Species.Op, Species.Hu, Species.Mu],
  },
});

// See _banned_combination
// https://github.com/crawl/crawl/blob/master/crawl-ref/source/ng-restr.cc
const VersionBannedCombosBackgrounds = {
  [Versions.v27]: {
    [Species.Fe]: { [Jobs.Gl]: true, [Jobs.Br]: true, [Jobs.Hu]: true, [Jobs.AM]: true },
    [Species.Dg]: { [Jobs.Be]: true, [Jobs.CK]: true, [Jobs.AK]: true, [Jobs.Mo]: true },
  },
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
function buildConvertedLookup(versionLookups) {
  return Object.keys(versionLookups).reduce((convertedVersionLookup, version) => {
    const baseLookup = versionLookups[version];
    const convertedLookup = {};

    Object.keys(baseLookup).forEach((key) => {
      if (!convertedLookup[key]) convertedLookup[key] = {};
      const values = baseLookup[key];
      values.forEach((value) => {
        convertedLookup[key][value] = true;
      });
    });

    // Initialize dictionary for this version
    convertedVersionLookup[version] = convertedLookup;

    // return the entire converted version lookup (reduce)
    return convertedVersionLookup;
  }, {});
}
