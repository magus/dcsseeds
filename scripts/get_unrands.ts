#!/usr/bin/env node

import { CPPCompiler } from 'scripts/cpp-parse/CPPCompiler';

import { pbcopy } from './pbcopy';
import { get_tile_map } from './get_tile_map';
import { read_file } from './read_file';
import * as crawl_dir from './crawl_dir';

const [, , VERSION] = process.argv;

if (!VERSION) {
  throw new Error(['Must specify VERSION', '  Example', '  > get_unrands 0.27.1', ''].join('\n'));
}

export type Unrand = {
  image_url: string;
  name: string;
  id: string;
};

// ignore sprint-only artifacts
// http://crawl.chaosforge.org/Axe_of_Woe
const IGNORE_UNRAND: Set<string> = new Set();
IGNORE_UNRAND.add('UNRAND_INVISIBILITY');
IGNORE_UNRAND.add('UNRAND_WOE');

(async function run() {
  crawl_dir.prepare(VERSION);

  const artefact_cc = await read_file(crawl_dir.dir(VERSION, 'crawl-ref/source/artefact.cc'));
  const art_data_h = await read_file(crawl_dir.dir(VERSION, 'crawl-ref/source/art-data.h'));

  const parsed = CPPCompiler(artefact_cc, {
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

    const unrand: any = {};

    for (let i = 0; i < field_list.length; i++) {
      const value = field_list[i];
      const name = field_names[i];
      unrand[name] = value;
    }

    return unrand;
  });

  // console.dir(unrand_list, { depth: null });
  // console.debug('unrand_list', unrand_list.length);

  const art_enum = CPPCompiler(await read_file(crawl_dir.dir(VERSION, 'crawl-ref/source/art-enum.h')));
  const [num_unrandarts_token] = art_enum.defines.NUM_UNRANDARTS.tokens;

  // ensure we parsed the same number as crawl repo scripts
  if (num_unrandarts_token.value !== unrand_list.length) {
    throw new Error('length of parsed unrands does not match expected length');
  }

  let unrand_enum_list: Array<string> = [];

  art_enum.traverse({
    Enum: {
      enter(node: any) {
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

  const tile_map = await get_tile_map({ version: VERSION, file_list: ['dc-unrand.txt'] });

  const filtered_unrand_list = [];

  for (let i = 0; i < unrand_list.length; i++) {
    const unrand = unrand_list[i];
    unrand.id = unrand_enum_list[i];
    unrand.tile_path = tile_map.get(unrand.id);

    // ignore dummy artifacts
    if (/DUMMY/.test(unrand.name)) {
      continue;
    }

    if (IGNORE_UNRAND.has(unrand.id)) {
      continue;
    }

    // validation for unfiltered unrands

    if (!Array.isArray(unrand.tile_path) || !unrand.tile_path.length) {
      console.error({ unrand });
      throw new Error('missing tile');
    }

    // normalize to first tile path
    const [first_tile_path] = unrand.tile_path;
    unrand.tile_path = first_tile_path;
    unrand.image_url = crawl_dir.github(first_tile_path);

    filtered_unrand_list.push(unrand);
  }

  const output_lines = ['', '// prettier-ignore'];
  output_lines.push('exports.UnrandList = [');
  for (const unrand of filtered_unrand_list) {
    // console.debug(unrand);
    const { image_url, name, id } = unrand;
    const output_unrand: Unrand = { image_url, name, id };
    output_lines.push(`  ${JSON.stringify(output_unrand)},`);
  }
  output_lines.push('];');

  pbcopy(output_lines.join('\n'));
  console.debug('unrand_list', filtered_unrand_list.length);
  console.info('📋 Copied `UnrandList` export to clipboard.');

  crawl_dir.reset();
})();

function extract_object_field(field: any) {
  switch (field.type) {
    case 'Object': {
      return field.fields.map(extract_object_field);
    }

    case 'Expression':
    default: {
      const value_list = field.params.map((p: any) => p.value);
      if (value_list.length === 1) {
        const [first_value] = value_list;
        return first_value;
      }
      return value_list;
    }
  }
}
