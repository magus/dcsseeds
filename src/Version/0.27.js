const Species = require('src/utils/Species');
const Jobs = require('src/utils/Backgrounds');

exports.Species = [
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
];

exports.Backgrounds = [
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
];

exports.RecommendedBackgrounds = {
  [Species.Ba]: [Jobs.Fi, Jobs.Be, Jobs.Wr, Jobs.AM, Jobs.Su, Jobs.IE],
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
};

exports.RecommendedSpecies = {
  [Jobs.AE]: [Species.DE, Species.Dj, Species.Te, Species.Dr, Species.Na, Species.VS],
  [Jobs.AK]: [Species.HO, Species.Pa, Species.Tr, Species.Mf, Species.Dr, Species.Ds],
  [Jobs.AM]: [Species.Fo, Species.DE, Species.Ko, Species.Sp, Species.Tr],
  [Jobs.Ar]: [Species.DD, Species.Ko, Species.Sp, Species.Dr, Species.Ds],
  [Jobs.Be]: [Species.HO, Species.Og, Species.Mf, Species.Mi, Species.Gr, Species.Pa],
  [Jobs.Br]: [Species.Tr, Species.Sp, Species.Ds, Species.Vp, Species.VS],
  [Jobs.Cj]: [Species.DE, Species.Dj, Species.Na, Species.Te, Species.Dr, Species.Dg],
  [Jobs.CK]: [Species.HO, Species.Tr, Species.Gn, Species.Mf, Species.Mi, Species.Dr, Species.Ds],
  [Jobs.De]: [Species.Fe, Species.Sp, Species.Ko, Species.Vp],
  [Jobs.EE]: [Species.DE, Species.DD, Species.Sp, Species.Gr, Species.Dg, Species.Gh, Species.Op],
  [Jobs.En]: [Species.DE, Species.Fe, Species.Ko, Species.Sp, Species.Na, Species.Vp],
  [Jobs.FE]: [Species.DE, Species.Dj, Species.HO, Species.Na, Species.Te, Species.Dg, Species.Gr],
  [Jobs.Fi]: [Species.DD, Species.HO, Species.Tr, Species.Mi, Species.Gr, Species.Pa],
  [Jobs.Gl]: [Species.DD, Species.HO, Species.Mf, Species.Mi, Species.Gr, Species.Gn],
  [Jobs.Hu]: [Species.HO, Species.Ko, Species.Og, Species.Tr],
  [Jobs.IE]: [Species.DE, Species.Dj, Species.Mf, Species.Na, Species.Dr, Species.Dg, Species.Gr],
  [Jobs.Mo]: [Species.DD, Species.HO, Species.Tr, Species.Pa, Species.Mf, Species.Gr, Species.Ds],
  [Jobs.Ne]: [Species.DE, Species.DD, Species.HO, Species.Ds, Species.Mu, Species.Vp],
  [Jobs.Su]: [Species.DE, Species.HO, Species.VS, Species.Mf, Species.Te, Species.Vp],
  [Jobs.Tm]: [Species.Na, Species.Mf, Species.Dr, Species.Dg, Species.Ds, Species.Tr],
  [Jobs.VM]: [Species.DE, Species.Dj, Species.Sp, Species.Na, Species.Mf, Species.Te, Species.Fe, Species.Ds],
  [Jobs.Wn]: [Species.HO, Species.Sp, Species.Gn, Species.Mf, Species.Dr, Species.Hu, Species.Ds],
  [Jobs.Wr]: [Species.Fe, Species.DD, Species.Sp, Species.Pa, Species.Dr],
  [Jobs.Wz]: [Species.DE, Species.Dj, Species.Na, Species.Dr, Species.Op, Species.Hu, Species.Mu],
};

exports.BannedCombos = {
  [Species.Fe]: { [Jobs.Gl]: true, [Jobs.Br]: true, [Jobs.Hu]: true, [Jobs.AM]: true },
  [Species.Dg]: { [Jobs.Be]: true, [Jobs.CK]: true, [Jobs.AK]: true, [Jobs.Mo]: true },
};