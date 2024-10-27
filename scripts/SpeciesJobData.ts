#!/usr/bin/env node
/* eslint-disable no-unused-vars */
import fs from 'node:fs/promises';
import path, { parse } from 'node:path';
import child_process from 'node:child_process';
import uniqBy from 'lodash/uniqBy';

import { CPPCompiler } from 'scripts/cpp-parse/CPPCompiler';

import { read_file } from './read_file';
import * as crawl_dir from './crawl_dir';

const NAME = 'SpeciesJobData';

(async function run() {
  // parallelize cpp file parsing
  const version_result_list = await Promise.all([
    parse_version('0.24.1'),
    parse_version('0.25.1'),
    parse_version('0.26.1'),
    parse_version('0.27.1'),
    parse_version('0.28.0'),
    parse_version('0.29.1'),
    parse_version('0.30.0'),
    parse_version('0.31.0'),
    parse_version('0.32.1'),
  ]);

  for (const version_result of version_result_list) {
    write_lines(version_result.version, [
      ...generate_data_lines('Species', version_result.species),
      ...generate_data_lines('Jobs', version_result.jobs),
    ]);
  }

  crawl_dir.reset();
})();

type SpeciesBackgroundData = {
  id: string;
  abbr: string;
  name: string;
};

function generate_data_lines(name: string, list: Array<SpeciesBackgroundData>) {
  const data_lines = [];

  for (const item of list) {
    data_lines.push(`  ${item.id}: ${JSON.stringify(item)},`);
  }

  data_lines.sort();

  return [
    // force line break for readability
    '',
    '// GENERATED',
    '// prettier-ignore',
    `const ${name} = {`,
    ...data_lines,
    `};`,
    '',
  ];
}

async function write_lines(filename: string, lines: Array<string>) {
  const filepath = path.join(__dirname, '__output__', NAME, filename);

  child_process.execSync(`mkdir -p ${path.dirname(filepath)}`);

  await fs.writeFile(filepath, lines.join('\n'));

  console.info(`📋 Generated [${filename}]`);
  console.info(filepath);
}

async function parse_version(version: string) {
  const [species, jobs] = await Promise.all([
    // parse species and job data in parallel
    parse_species_data(version),
    parse_job_data(version),
  ]);

  return { version, species, jobs };
}

async function parse_species_data(version: string) {
  crawl_dir.prepare(version);

  const species_data_h = CPPCompiler(await read_file(crawl_dir.dir(version, 'crawl-ref/source/species-data.h')));
  // console.dir(species_data_h);

  let data_fields: Array<CPPNode> = [];

  species_data_h.traverse({
    Assignment: {
      enter(node: CPPNode) {
        if (node.name.value === 'species_data') {
          data_fields = node.value.fields;
        }
      },
    },
  });

  let list = [];

  for (const entry of data_fields) {
    const species_data = parse_species_entry(entry);
    list.push(species_data);
  }

  // remove duplicate Draconian species
  list = uniqBy(list, (s) => s.abbr);

  // remove debug unknown species
  list = list.filter((s) => s.abbr !== '??');

  console.debug(version, list);

  return list;
}

async function parse_job_data(version: string) {
  crawl_dir.prepare(version);

  const job_data_h = CPPCompiler(await read_file(crawl_dir.dir(version, 'crawl-ref/source/job-data.h')));
  // console.dir(job_data_h);

  let data_fields: Array<CPPNode> = [];

  job_data_h.traverse({
    Assignment: {
      enter(node: CPPNode) {
        if (node.name.value === 'job_data') {
          data_fields = node.value.fields;
        }
      },
    },
  });

  let list = [];

  for (const entry of data_fields) {
    const job_data = parse_job_entry(version, entry);
    list.push(job_data);
  }

  // remove duplicate Draconian species
  list = uniqBy(list, (s) => s.abbr);

  // remove debug unknown species
  list = list.filter((s) => s.abbr !== '??');

  console.debug(version, list);

  return list;
}

function parse_species_entry(object: CPPNode) {
  const [id_node, data_object] = object.fields;

  const [
    abbr_node,
    name_node,
    name_adj_node,
    genus_node,
    flags_node,
    xp_node,
    hp_node,
    mp_node,
    wl_node,
    monster_node,
    habitat_node,
    undead_node,
    size_node,
    str_node,
    int_node,
    dex_node,
    level_up_node,
    level_stat_inc_node,
    level_mutation_node,
    fake_mutation_a_node,
    fake_mutation_b_node,
    recommended_jobs_node,
    recommended_weapons_node,
    walk_action_node,
    pray_action_node,
    child_name_node,
  ] = data_object.fields;

  const id: string = id_node.params[0].value;
  const abbr: string = abbr_node.params[0].value;
  const name: string = name_node.params[0].value;

  const recommended_jobs: Array<string> = [];
  for (const job_node of recommended_jobs_node.fields) {
    recommended_jobs.push(job_node.params[0].value);
  }

  return { id, abbr, name, recommended_jobs };

  // *
  // * Entry format:
  // *   row  0: species enum
  // *   row  1: two-letter abbreviation
  // *   row  2: name noun, name adjective, genus (null to use name)
  // *   row  3: flags (SPF_*)
  // *   row  4: XP "aptitude", HP mod (in tenths), MP mod, WL per XL
  // *   row  5: corresponding monster
  // *   row  6: habitat, undead state, size
  // *   row  7: starting strength, intelligence, dexterity  // sum
  // *   row  8: { level-up stats }, level for stat increase
  // *   row  9: { { mutation, mutation level, XP level }, ... }
  // *   row 10: { fake mutation messages for A screen }
  // *   row 11: { fake mutation names for % screen }
  // *   row 12: recommended jobs for character selection
  // *   row 13: recommended weapons for character selection
  // *   row 14: custom walking action, or nullptr
  // *   row 15: custom prayer action, or nullptr
  // */
  //
  // static const map<species_type, species_def> species_data =
  // {
  //
  // { SP_ARMATAUR, {
  //     "At",
  //     "Armataur", nullptr, nullptr,
  //     SPF_SMALL_TORSO | SPF_BARDING,
  //     -1, 1, 0, 3,
  //     MONS_ARMATAUR,
  //     HT_LAND, US_ALIVE, SIZE_LARGE,
  //     13, 8, 5,
  //     { STAT_STR, STAT_INT, STAT_DEX }, 4,
  //     { { MUT_ARMOURED_TAIL, 1, 1 }, { MUT_DEFORMED, 1, 1 }, { MUT_ROLLPAGE, 1, 1 }, { MUT_TOUGH_SKIN, 3, 1 }, { MUT_ROLLPAGE, 1, 7 } },
  //     {},
  //     {},
  //     { JOB_FIGHTER, JOB_BERSERKER, JOB_WARPER, JOB_HEDGE_WIZARD },
  //     { SK_UNARMED_COMBAT, SK_MACES_FLAILS, SK_AXES, SK_STAVES },
  //     nullptr,
  //     "curl up in front of",
  //     "Pup",
  // } },
}

function parse_job_entry(version: string, object: CPPNode) {
  const [id_node, data_object] = object.fields;

  const [
    abbr_node,
    name_node,
    str_node,
    dex_node,
    int_node,
    recommended_species_node,
    equipment_node,
    weapon_choice_node,
    skills_node,
  ] = data_object.fields;

  const id: string = id_node.params[0].value;
  const abbr: string = abbr_node.params[0].value;
  const name: string = name_node.params[0].value;

  console.debug(recommended_species_node.fields);

  const species_node_list = (function () {
    switch (version) {
      case '0.32.1':
        return recommended_species_node.fields[0].fields;
      default:
        return recommended_species_node.fields;
    }
  })();

  const recommended_species: Array<string> = [];
  for (const species_node of species_node_list) {
    recommended_species.push(species_node.params[0].value);
  }

  return { id, abbr, name, recommended_species };

  // struct job_def
  // {
  //     const char* abbrev; ///< Two-letter abbreviation
  //     const char* name; ///< Long name
  //     int s, i, d; ///< Starting Str, Dex, and Int
  //     /// Which species are good at it
  //     /// No recommended species = job is disabled
  //     vector<species_type> recommended_species;
  //     /// Guaranteed starting equipment. Uses vault spec syntax, with the plus:,
  //     /// charges:, q:, and ego: tags supported.
  //     vector<string> equipment;
  //     weapon_choice wchoice; ///< how the weapon is chosen, if any
  //     vector<pair<skill_type, int>> skills; ///< starting skills
  // };

  // static const map<job_type, job_def> job_data =
  // {

  // { JOB_ABYSSAL_KNIGHT, {
  //     "AK", "Abyssal Knight",
  //     4, 4, 4,
  //     { SP_HILL_ORC, SP_SPRIGGAN, SP_TROLL, SP_MERFOLK, SP_BASE_DRACONIAN,
  //       SP_DEMONSPAWN, },
  //     { "leather armour" },
  //     WCHOICE_PLAIN,
  //     { { SK_FIGHTING, 3 }, { SK_ARMOUR, 1 }, { SK_DODGING, 1 },
  //       { SK_INVOCATIONS, 2 }, { SK_WEAPON, 2 }, },
  // } },
}

type CPPNode = {
  type: string;
  [key: string]: any;
};
