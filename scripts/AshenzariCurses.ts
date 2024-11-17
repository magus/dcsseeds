#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import { CPPCompiler } from 'scripts/cpp-parse/CPPCompiler';

import { read_file } from './read_file';
import * as crawl_dir from './crawl_dir';

(async function run() {
  const curse_result_list = await Promise.all([
    // parallelize cpp file parsing
    parse_curse_list('0.27.1'),
    parse_curse_list('0.28.0'),
    parse_curse_list('0.29.1'),
    parse_curse_list('0.30.0'),
    parse_curse_list('0.31.0'),
    parse_curse_list('0.32.1'),
  ]);

  // gather all curses by id
  const curse_by_id: Record<string, Curse> = {};

  for (const curse_result of curse_result_list) {
    const version = curse_result.version;

    for (const curse of curse_result.list) {
      console.debug({ curse });

      const maybe_curse = curse_by_id[curse.id];

      if (!maybe_curse) {
        const last_version = version;
        curse_by_id[curse.id] = { ...curse, version, last_version };
        continue;
      }

      // compare maybe_curse and curse but ignore version fields
      const compare_curse = cloneDeep(maybe_curse);
      delete compare_curse.version;
      delete compare_curse.last_version;

      // ensure curse entry matches, update version
      if (isEqual(compare_curse, curse)) {
        maybe_curse.last_version = version;
        continue;
      }

      console.error({ compare_curse, curse });
      console.error();
      throw new Error('curse-id-mismatch');
    }
  }

  console.debug({ curse_by_id });

  const curse_list = Object.values(curse_by_id);

  // output
  const output_lines = ['// GENERATED'];

  output_lines.push('');
  output_lines.push(`export const List = ${JSON.stringify(curse_list)};`);

  const abbr_map: Record<string, Curse> = {};
  for (const curse of curse_list) {
    abbr_map[curse.abbr] = curse;
  }

  output_lines.push('');
  output_lines.push(`export const ByAbbr = ${JSON.stringify(abbr_map)};`);

  const output_path = path.join(__dirname, '__output__', 'AshenzariCurses.ts');
  fs.writeFileSync(output_path, output_lines.join('\n'));
  execSync(`pnpm prettier --write "${output_path}"`);

  console.info('📋 Generated `AshenzariCurses.ts`');
  console.info(output_path);

  crawl_dir.reset();
})();

async function parse_curse_list(version: string): Promise<{ list: Array<Curse>; version: string }> {
  crawl_dir.prepare(version);

  const god_abil_cc = CPPCompiler(await read_file(crawl_dir.dir(version, 'crawl-ref/source/god-abil.cc')));

  // static map<curse_type, curse_data> _ashenzari_curses =
  let curse_object_list: any;

  god_abil_cc.traverse({
    Assignment: {
      enter(node: any) {
        if (node.name.value === '_ashenzari_curses') {
          curse_object_list = node.value.fields;
        }
      },
    },
  });

  if (!Array.isArray(curse_object_list)) {
    throw new Error('unable to find curses');
  }

  const list = curse_object_list.map(extract_curse);

  return { list, version };
}

type Curse = {
  id: string;
  name: string;
  abbr: string;
  version?: string;
  last_version?: string;
};

function extract_curse(object: any): Curse {
  const curse = {
    id: '',
    name: '',
    abbr: '',
    // boosted: [],
  };

  // static map<curse_type, curse_data> _ashenzari_curses =
  const [type_expression, data_object] = object.fields;
  // console.dir({ type_expression, data_object }, { depth: null });

  // curse_type is just an identifier
  const [type_identifier] = type_expression.params;
  curse.id = type_identifier.value;

  // shape of curse data is defined directly above `_ashenzari_curses`
  // struct curse_data
  // {
  //     string name;
  //     string abbr;
  //     vector<skill_type> boosted;
  // };
  const [
    name_expression,
    abbr_expression,
    // boosted_object
  ] = data_object.fields;

  const [name_identifier] = name_expression.params;
  curse.name = name_identifier.value;

  const [abbr_identifier] = abbr_expression.params;
  curse.abbr = abbr_identifier.value;

  // for (const expression of boosted_object.fields) {
  //   const [idenfitier] = expression.params;
  //   curse.boosted.push(idenfitier.value);
  // }

  return curse;

  // {
  //   type: 'Object',
  //   fields: [
  //     {
  //       type: 'Expression',
  //       params: [
  //         {
  //           type: 'Identifier',
  //           value: 'CURSE_EVOCATIONS',
  //           row: 2094,
  //           col: 7,
  //         },
  //       ],
  //     },
  //     {
  //       type: 'Object',
  //       fields: [
  //         {
  //           type: 'Expression',
  //           params: [
  //             {
  //               type: 'String',
  //               value: 'Evocations',
  //               row: 2095,
  //               col: 10,
  //             },
  //           ],
  //         },
  //         {
  //           type: 'Expression',
  //           params: [{ type: 'String', value: 'Evo', row: 2095, col: 24 }],
  //         },
  //         {
  //           type: 'Object',
  //           fields: [
  //             {
  //               type: 'Expression',
  //               params: [
  //                 {
  //                   type: 'Identifier',
  //                   value: 'SK_EVOCATIONS',
  //                   row: 2096,
  //                   col: 11,
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // }
}
