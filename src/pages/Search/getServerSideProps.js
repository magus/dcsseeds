import { gql } from '@apollo/client';

import fetch from 'src/utils/fetch';
import { serverQuery } from 'src/graphql/serverQuery';
import { random, randomElement } from 'src/utils/random';

export default async function getServerSideProps(context) {
  const fork = random() > 0.5;
  const list = fork ? BRANDS : UNRANDS;
  const placeholder = randomElement(list);

  const totalItemCount = await GQL_TOTAL_ITEMS.run();
  const props = { placeholder, totalItemCount };
  return { props };
}

// Item brands
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/item-name.cc
const BRANDS = [
  '+Fly',
  '+Inv',
  '+Rage',
  'AC',
  'AC+3',
  'Acrobat',
  'archery',
  'Archmagi',
  'Dex',
  'Dex+3',
  'EV',
  'Fly',
  'harm',
  'Int',
  'Int+3',
  'MP+9',
  'ponderous',
  'rampage',
  'rC+',
  'rCorr',
  'reflect',
  'Regen',
  'rF+',
  'rN+',
  'rPois',
  'shadows',
  'SInv',
  'Slay',
  'Spirit',
  'Stlth+',
  'Str',
  'Str+3',
  'Will+',
];

// Unrand items
// Search here, items that are disabled have BOOL: nogen
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/art-data.txt
// Wiki is out of date but convenient
// http://crawl.chaosforge.org/List_of_unrands
// All unrand descriptions
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/dat/descript/unrand.txt
const UNRANDS = [
  `amulet of the Air`,
  `amulet of the Four Winds`,
  `amulet of Vitality`,
  `arbalest "Damnation"`,
  `arc blade`,
  `autumn katana`,
  `Axe of Woe`,
  `Black Knight's barding`,
  `brooch of Shielding`,
  `captain's cutlass`,
  `Cigotuvi's embrace`,
  `cloak of Starlight`,
  `cloak of the Thief`,
  `crown of Dyrovepreva`,
  `dagger "Morg"`,
  `dark maul`,
  `demon blade "Leech"`,
  `demon trident "Rift"`,
  `demon whip "Spellbinder"`,
  `dragonskin cloak`,
  `Elemental Staff`,
  `faerie dragon scales`,
  `fencer's gloves`,
  `frozen axe "Frostbite"`,
  `gauntlets of War`,
  `giant club "Skullcrusher"`,
  `glaive of Prune`,
  `glaive of the Guard`,
  `great mace "Firestarter"`,
  `great mace "Undeadhunter"`,
  `hat of Pondering`,
  `hat of the Alchemist`,
  `hat of the Bear Spirit`,
  `heavy crossbow "Sniper"`,
  `hood of the Assassin`,
  `Kryia's mail coat`,
  `lajatang of Order`,
  `lance "Wyrmbane"`,
  `Lear's hauberk`,
  `lightning scales`,
  `longbow "Zephyr"`,
  `macabre finger necklace`,
  `mace of Variability`,
  `Majin-Bo`,
  `mask of the Dragon`,
  `Maxwell's patent armour`,
  `Maxwell's thermic engine`,
  `mithril axe "Arga"`,
  `moon troll leather armour`,
  `morningstar "Eos"`,
  `necklace of Bloodlust`,
  `obsidian axe`,
  `orange crystal plate armour`,
  `plutonium sword`,
  `quick blades "Gyre" and "Gimble"`,
  `ratskin cloak`,
  `ring of Shadows`,
  `ring of the Hare`,
  `ring of the Mage`,
  `ring of the Octopus King`,
  `ring of the Tortoise`,
  `robe of Augmentation`,
  `robe of Clouds`,
  `robe of Folly`,
  `robe of Misfortune`,
  `robe of Night`,
  `robe of Vines`,
  `salamander hide armour`,
  `scales of the Dragon King`,
  `sceptre of Asmodeus`,
  `sceptre of Torment`,
  `scythe "Finisher"`,
  `scythe of Curses`,
  `shield of Resistance`,
  `shield of the Gong`,
  `shillelagh "Devastator"`,
  `Singing Sword`,
  `skin of Zhor`,
  `sling "Punk"`,
  `Spriggan's Knife`,
  `staff of Battle`,
  `staff of Dispater`,
  `staff of Olgreb`,
  `staff of Wucad Mu`,
  `storm bow`,
  `sword of Cerebov`,
  `sword of Power`,
  `sword of Zonguldrok`,
  `tower shield of Ignorance`,
  `trident of the Octopus King`,
  `Vampire's Tooth`,
  `warlock's mirror`,
  `whip "Snakebite"`,
  `Wrath of Trog`,
  `zealot's sword`,
];

const GQL_TOTAL_ITEMS = serverQuery(
  gql`
    query TotalItems {
      items: dcsseeds_scrapePlayers_item_aggregate {
        aggregate {
          count(columns: id)
        }
      }
    }
  `,
  (data) => data.items.aggregate.count,
);
