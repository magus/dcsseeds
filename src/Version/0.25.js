const Species = require('../utils/Species');
const Jobs = require('../utils/Backgrounds');

exports.Species = [
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
];

exports.Backgrounds = [
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
];

exports.RecommendedBackgrounds = {
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
};

exports.RecommendedSpecies = {
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
};

exports.BannedCombos = {
  [Species.Fe]: { [Jobs.Gl]: true, [Jobs.As]: true, [Jobs.Hu]: true, [Jobs.AM]: true },
  [Species.Dg]: { [Jobs.Be]: true, [Jobs.CK]: true, [Jobs.AK]: true, [Jobs.Mo]: true },
};

// prettier-ignore
exports.UnrandList = [
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_singing_sword.png","name":"Singing Sword","id":"UNRAND_SINGING_SWORD"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_wrath_of_trog.png","name":"Wrath of Trog","id":"UNRAND_TROG"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_mace_of_variability.png","name":"mace of Variability","id":"UNRAND_VARIABILITY"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_glaive_of_prune.png","name":"glaive of Prune","id":"UNRAND_PRUNE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_sword_of_power.png","name":"sword of Power","id":"UNRAND_POWER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_staff_of_olgreb.png","name":"staff of Olgreb","id":"UNRAND_OLGREB"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_wucad_mu.png","name":"staff of Wucad Mu","id":"UNRAND_WUCAD_MU"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_vampires_tooth.png","name":"Vampire's Tooth","id":"UNRAND_VAMPIRES_TOOTH"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_scythe_of_curses.png","name":"scythe of Curses","id":"UNRAND_CURSES"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_sceptre_of_torment.png","name":"sceptre of Torment","id":"UNRAND_TORMENT"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_sword_of_zonguldrok.png","name":"sword of Zonguldrok","id":"UNRAND_ZONGULDROK"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_sword_of_cerebov.png","name":"sword of Cerebov","id":"UNRAND_CEREBOV"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_staff_of_dispater.png","name":"staff of Dispater","id":"UNRAND_DISPATER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_sceptre_of_asmodeus.png","name":"sceptre of Asmodeus","id":"UNRAND_ASMODEUS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_faerie.png","name":"faerie dragon scales","id":"UNRAND_FAERIE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_leech.png","name":"demon blade \"Leech\"","id":"UNRAND_LEECH"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_morg.png","name":"dagger \"Morg\"","id":"UNRAND_MORG"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_finisher.png","name":"scythe \"Finisher\"","id":"UNRAND_FINISHER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_punk.png","name":"sling \"Punk\"","id":"UNRAND_PUNK"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_zephyr.png","name":"longbow \"Zephyr\"","id":"UNRAND_ZEPHYR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_skullcrusher.png","name":"giant club \"Skullcrusher\"","id":"UNRAND_SKULLCRUSHER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_guard.png","name":"glaive of the Guard","id":"UNRAND_GUARD"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/unrand_zealot_sword.png","name":"zealot's sword","id":"UNRAND_ZEALOT_SWORD"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_damnation.png","name":"arbalest \"Damnation\"","id":"UNRAND_DAMNATION"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_eos.png","name":"morningstar \"Eos\"","id":"UNRAND_EOS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_octopus_king.png","name":"trident of the Octopus King","id":"UNRAND_OCTOPUS_KING"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_arga.png","name":"mithril axe \"Arga\"","id":"UNRAND_ARGA"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_elemental.png","name":"Elemental Staff","id":"UNRAND_ELEMENTAL_STAFF"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_sniper.png","name":"heavy crossbow \"Sniper\"","id":"UNRAND_SNIPER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_wyrmbane.png","name":"lance \"Wyrmbane\"","id":"UNRAND_WYRMBANE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_spriggans_knife.png","name":"Spriggan's Knife","id":"UNRAND_SPRIGGANS_KNIFE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_plutonium.png","name":"plutonium sword","id":"UNRAND_PLUTONIUM_SWORD"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_undeadhunter.png","name":"great mace \"Undeadhunter\"","id":"UNRAND_UNDEADHUNTER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_snakebite.png","name":"whip \"Snakebite\"","id":"UNRAND_SNAKEBITE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_cutlass.png","name":"captain's cutlass","id":"UNRAND_CAPTAIN"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_storm_bow.png","name":"storm bow","id":"UNRAND_STORM_BOW"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_ignorance.png","name":"tower shield of Ignorance","id":"UNRAND_IGNORANCE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_augmentation.png","name":"robe of Augmentation","id":"UNRAND_AUGMENTATION"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_thief.png","name":"cloak of the Thief","id":"UNRAND_THIEF"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_dyrovepreva.png","name":"crown of Dyrovepreva","id":"UNRAND_DYROVEPREVA"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_bear.png","name":"hat of the Bear Spirit","id":"UNRAND_BEAR_SPIRIT"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_misfortune.png","name":"robe of Misfortune","id":"UNRAND_MISFORTUNE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_hood_assassin.png","name":"hood of the Assassin","id":"UNRAND_HOOD_ASSASSIN"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_lear.png","name":"Lear's hauberk","id":"UNRAND_LEAR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_zhor.png","name":"skin of Zhor","id":"UNRAND_ZHOR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_salamander.png","name":"salamander hide armour","id":"UNRAND_SALAMANDER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_war.png","name":"gauntlets of War","id":"UNRAND_WAR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_resistance.png","name":"shield of Resistance","id":"UNRAND_RESISTANCE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_folly.png","name":"robe of Folly","id":"UNRAND_FOLLY"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_maxwell.png","name":"Maxwell's patent armour","id":"UNRAND_MAXWELL"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_dragonmask.png","name":"mask of the Dragon","id":"UNRAND_DRAGONMASK"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_night.png","name":"robe of Night","id":"UNRAND_NIGHT"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_dragon_king.png","name":"scales of the Dragon King","id":"UNRAND_DRAGON_KING"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_alchemist.png","name":"hat of the Alchemist","id":"UNRAND_ALCHEMIST"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_fencer.png","name":"fencer's gloves","id":"UNRAND_FENCERS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_starlight.png","name":"cloak of Starlight","id":"UNRAND_STARLIGHT"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_ratskin_cloak.png","name":"ratskin cloak","id":"UNRAND_RATSKIN_CLOAK"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_gong.png","name":"shield of the Gong","id":"UNRAND_GONG"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/amulet/artefact/urand_air.png","name":"amulet of the Air","id":"UNRAND_AIR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/ring/artefact/urand_shadows.png","name":"ring of Shadows","id":"UNRAND_SHADOWS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/amulet/artefact/urand_four_winds.png","name":"amulet of the Four Winds","id":"UNRAND_FOUR_WINDS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/amulet/artefact/urand_bloodlust.png","name":"necklace of Bloodlust","id":"UNRAND_BLOODLUST"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/ring/artefact/urand_phasing.png","name":"ring of Phasing","id":"UNRAND_PHASING"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/ring/artefact/urand_robustness.png","name":"ring of Robustness","id":"UNRAND_ROBUSTNESS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/ring/artefact/urand_mage.png","name":"ring of the Mage","id":"UNRAND_MAGE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/amulet/artefact/urand_brooch_of_shielding.png","name":"brooch of Shielding","id":"UNRAND_SHIELDING"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_clouds.png","name":"robe of Clouds","id":"UNRAND_RCLOUDS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_pondering.png","name":"hat of Pondering","id":"UNRAND_PONDERING"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_demon_axe.png","name":"obsidian axe","id":"UNRAND_DEMON_AXE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_lightning_scales.png","name":"lightning scales","id":"UNRAND_LIGHTNING_SCALES"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_bk_barding.png","name":"Black Knight's horse barding","id":"UNRAND_BLACK_KNIGHT_HORSE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/amulet/artefact/urand_vitality.png","name":"amulet of Vitality","id":"UNRAND_VITALITY"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_katana.png","name":"autumn katana","id":"UNRAND_AUTUMN_KATANA"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_shillelagh.png","name":"shillelagh \"Devastator\"","id":"UNRAND_DEVASTATOR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_dragonskin.png","name":"dragonskin cloak","id":"UNRAND_DRAGONSKIN"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/ring/artefact/urand_octoring.png","name":"ring of the Octopus King","id":"UNRAND_OCTOPUS_KING_RING"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_moon_troll_leather_armour.png","name":"moon troll leather armour","id":"UNRAND_MOON_TROLL_LEATHER_ARMOUR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/amulet/artefact/urand_finger.png","name":"macabre finger necklace","id":"UNRAND_FINGER_AMULET"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_dark_maul.png","name":"dark maul","id":"UNRAND_DARK_MAUL"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_arc_blade.png","name":"arc blade","id":"UNRAND_ARC_BLADE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_spellbinder.png","name":"demon whip \"Spellbinder\"","id":"UNRAND_SPELLBINDER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_order.png","name":"lajatang of Order","id":"UNRAND_ORDER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_firestarter.png","name":"great mace \"Firestarter\"","id":"UNRAND_FIRESTARTER"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_orange_crystal.png","name":"orange crystal plate armour","id":"UNRAND_ORANGE_CRYSTAL_PLATE_ARMOUR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/spwpn_majin.png","name":"Majin-Bo","id":"UNRAND_MAJIN"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_gyre.png","name":"pair of quick blades \"Gyre\" and \"Gimble\"","id":"UNRAND_GYRE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_vines.png","name":"robe of Vines","id":"UNRAND_VINES"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_kryias.png","name":"Kryia's mail coat","id":"UNRAND_KRYIAS"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_frostbite.png","name":"frozen axe \"Frostbite\"","id":"UNRAND_FROSTBITE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_warlock.png","name":"warlock's mirror","id":"UNRAND_WARLOCK_MIRROR"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_thermic_engine.png","name":"Maxwell's thermic engine","id":"UNRAND_THERMIC_ENGINE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_rift.png","name":"demon trident \"Rift\"","id":"UNRAND_RIFT"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/weapon/artefact/urand_staff_of_battle.png","name":"staff of Battle","id":"UNRAND_BATTLE"},
  {"image_url":"https://raw.githubusercontent.com/crawl/crawl/0.25.0/crawl-ref/source/rltiles/item/armour/artefact/urand_cigotuvi.png","name":"Cigotuvi's embrace","id":"UNRAND_EMBRACE"},
];
