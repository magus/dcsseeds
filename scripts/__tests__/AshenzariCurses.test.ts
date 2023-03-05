import { jest, expect, test } from '@jest/globals';
import path from 'path';
import { execSync } from 'child_process';

import { read_file } from '../read_file';

const SCRIPTS_DIR = path.join(__dirname, '..');

jest.setTimeout(30 * 1000);

test('run and verify output', async () => {
  process.chdir(SCRIPTS_DIR);
  const command = `yarn tsx ${path.join(SCRIPTS_DIR, 'AshenzariCurses')}`;
  execSync(command, { stdio: 'pipe' });
  const output_path = path.join(SCRIPTS_DIR, '__output__', 'AshenzariCurses.ts');
  const content = await read_file(output_path);
  expect(content).toMatchSnapshot();
});
