#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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
  ]);

  // ensure all version outputs are the same
  // if not throws an error for manual investigation
  let [current_result] = curse_result_list;
  for (const curse_result of curse_result_list.slice(1)) {
    if (!current_result) {
      current_result = curse_result;
    } else {
      // compare
      // throw new Error(`[${curse_result.version}] introduced change, requires manual investigation`);
      for (let i = 0; i < current_result.list.length; i++) {
        const before = current_result.list[i];
        const after = curse_result.list[i];

        if (JSON.stringify(before) !== JSON.stringify(after)) {
          console.error({ before, after });
          throw new Error(`[${curse_result.version}] introduced change requires manual investigation`);
        }
      }
    }
  }

  const curse_list = current_result.list;

  // output
  const output_lines = ['// GENERATED'];

  output_lines.push('');
  output_lines.push(`export const List = ${JSON.stringify(curse_list)};`);

  const abbr_map: { [key: string]: Curse } = {};
  for (const curse of curse_list) {
    abbr_map[curse.abbr] = curse;
  }

  output_lines.push('');
  output_lines.push(`export const ByAbbr = ${JSON.stringify(abbr_map)};`);

  const output_path = path.join(__dirname, '__output__', 'AshenzariCurses.ts');
  fs.writeFileSync(output_path, output_lines.join('\n'));
  execSync(`yarn prettier --write "${output_path}"`);

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

type Curse = { id: string; name: string; abbr: string };

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
