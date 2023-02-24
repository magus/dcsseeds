#!/usr/bin/env node
const fs_promises = require('fs').promises;
const fs = require('fs');
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');
const { execSync } = require('child_process');

const [, , VERSION] = process.argv;

if (!VERSION) {
  throw new Error(['Must specify VERSION', '  Example', '  > get_unrands 0.27.1', ''].join('\n'));
}

const GITHUB_RAW = `https://raw.githubusercontent.com/crawl/crawl/${VERSION}`;
const PROJ_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();

// prepare crawl git submodule by checking out specific version for parsing
process.chdir(`${PROJ_ROOT}/crawl`);

// sync tags with origin (e.g. version tags like 0.27.0)
// execSync('git fetch origin');

// checkout the specified version for parsing
execSync(`git reset --hard`);
execSync(`git checkout ${VERSION} > /dev/null 2>&1`);

// run tasks to prepare files for processing (e.g. remove development items tagged with TAG_MAJOR_VERSION)
// see crawl/.github/workflows/ci.yml
process.chdir(`${PROJ_ROOT}/crawl/crawl-ref/source`);
execSync('util/tag-major-upgrade -t 35');
if (fs.existsSync('util/tag-35-upgrade.py > /dev/null 2>&1')) {
  execSync('util/tag-35-upgrade.py');
}

// now we can generate `source/art-data.h`
execSync('perl util/art-data.pl');

// return to PROJ_ROOT
process.chdir(PROJ_ROOT);

(async function run() {
  const artefact_cc = await readFile(`${PROJ_ROOT}/crawl/crawl-ref/source/artefact.cc`);
  const art_data_h = await readFile(`${PROJ_ROOT}/crawl/crawl-ref/source/art-data.h`);

  const parsed = new CPPCompiler(artefact_cc, {
    include: {
      'art-data.h': art_data_h,
    },
  });

  let raw_object_list;

  for (const statement of parsed.ast.body) {
    if (statement.type === 'Assignment') {
      if (statement.name.value === 'unranddata[]') {
        raw_object_list = statement.value.fields;
      }
    }
  }

  if (!raw_object_list) {
    throw new Error('Unable to find unranddata[]');
  }

  const flat_object_list = [];

  for (const object of raw_object_list) {
    const fields = object.fields.map(extract_object_field);
    flat_object_list.push(fields);
  }

  const unrand_list = flat_object_list.map((field_list) => {
    // `unrandart_entry` defines the artefact shape (crawl-ref/source/artefact.h)
    const field_names = [
      // const char *name;        // true name of unrandart
      'name',
      // const char *unid_name;   // un-id'd name of unrandart
      'unid_name',
      // const char *type_name;   // custom item type
      'type_name',
      // const char *inscrip;     // extra inscription
      'inscrip',
      // const char *dbrand;      // description of extra brand
      'dbrand',
      // const char *descrip;     // description of extra power
      'descrip',
      // object_class_type base_type;
      'base_type',
      // uint8_t           sub_type;
      'sub_type',
      // object_class_type fallback_base_type;
      'fallback_base_type',
      // uint8_t           fallback_sub_type;
      'fallback_sub_type',
      // int               fallback_brand;
      'fallback_brand',
      // short             plus;
      'plus',
      // short             plus2;
      'plus2',
      // colour_t          colour;
      'colour',
      // short         value;
      'value',
      // uint16_t      flags;
      'flags',
      // short prpty[ART_PROPERTIES];
      'prpty',
      // void (*equip_func)(item_def* item, bool* show_msgs, bool unmeld);
      'equip_func',
      // void (*unequip_func)(item_def* item, bool* show_msgs);
      'unequip_func',
      // void (*world_reacts_func)(item_def* item);
      'world_reacts_func',
      // void (*melee_effects)(item_def* item, actor* attacker,
      //                       actor* defender, bool mondied, int damage);
      'melee_effects',
      // setup_missile_type (*launch)(item_def* item, bolt* beam,
      //                               string* ammo_name, bool* returning);
      'launch',
      // bool (*evoke_func)(item_def *item, bool* did_work, bool* unevokable);
      'evoke_func',
      // bool (*targeted_evoke_func)(item_def *item, bool* did_work, bool* unevokable, dist* target);
      'targeted_evoke_func',
    ];

    const unrand = {};

    for (let i = 0; i < field_list.length; i++) {
      const value = field_list[i];
      const name = field_names[i];
      unrand[name] = value;
    }

    return unrand;
  });

  // console.dir(unrand_list, { depth: null });
  console.debug('unrand_list', unrand_list.length);

  const art_enum = new CPPCompiler(await readFile(`${PROJ_ROOT}/crawl/crawl-ref/source/art-enum.h`));
  const [num_unrandarts_token] = art_enum.defines.NUM_UNRANDARTS.tokens;

  // ensure we parsed the same number as crawl repo scripts
  if (num_unrandarts_token.value !== unrand_list.length) {
    throw new Error('length of parsed unrands does not match expected length');
  }

  let unrand_enum_list = [];

  art_enum.traverse({
    Enum: {
      enter(node, parent) {
        if (node.name.value === 'unrand_type') {
          let start = false;
          for (const enum_entry of node.values) {
            // exit on LAST
            if (enum_entry.name.value === 'UNRAND_LAST') {
              break;
            }

            if (enum_entry.name.value === 'UNRAND_START') {
              start = true;
            } else if (start) {
              unrand_enum_list.push(enum_entry.name.value);
            }
          }
        }
      },
    },
  });

  // art-enum.h contains a 1:1 mapping of the enums for each artifact above
  // the numbers must match before we proceed to matching them up
  // ensure we parsed the same number as crawl repo scripts
  if (unrand_list.length !== unrand_enum_list.length) {
    throw new Error('art-enum.h contains different number of parsed unrands');
  }

  const filtered_unrand_list = [];

  for (let i = 0; i < unrand_list.length; i++) {
    const unrand = unrand_list[i];
    unrand.enum = unrand_enum_list[i];

    // ignore dummy artifacts
    if (/DUMMY/.test(unrand.name)) {
      continue;
    }

    // ignore this sprint-only artifact
    // http://crawl.chaosforge.org/Axe_of_Woe
    if (unrand.name === 'Axe of Woe') {
      continue;
    }

    filtered_unrand_list.push(unrand);
  }

  const output_lines = [''];
  output_lines.push('exports.UnrandList = [');
  for (const unrand of filtered_unrand_list) {
    // console.debug(unrand);
    output_lines.push(`  ${JSON.stringify(unrand.name)},`);
  }
  output_lines.push('];');

  console.debug(output_lines.join('\n'));
})();

function extract_object_field(field) {
  switch (field.type) {
    case 'Object': {
      return field.fields.map(extract_object_field);
    }

    case 'Expression':
    default: {
      const value_list = field.params.map((p) => p.value);
      if (value_list.length === 1) {
        const [first_value] = value_list;
        return first_value;
      }
      return value_list;
    }
  }
}

async function readFile(filename) {
  let buffer = await fs_promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return source;
}
