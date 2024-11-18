import { expect, test } from 'bun:test';

import * as semver from 'src/utils/semver';

const test_case_list = [
  ['0.27.1', '0.27.1', 0],
  ['0.27.1', '0.27.0', +1],
  ['0.27.1', '0.27', +1],
  ['0.27.0', '0.27.1', -1],
  ['0.27', '0.27.1', -1],
  ['0.28.0', '0.27.1', +1],
  ['0.26.0', '0.27.1', -1],
  ['1.2.0', '0.27.1', +1],
  ['0.0.30', '0.27.1', -1],
];

for (const test_case of test_case_list) {
  const [a, b, expected] = test_case;

  test(`semver.compare("${a}", "${b}") = ${expected}`, () => {
    const result = semver.compare(a, b);
    expect(result).toBe(expected);
  });
}
