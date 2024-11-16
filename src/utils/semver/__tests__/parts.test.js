import * as semver from 'src/utils/semver';

const test_case_list = [
  ['0.27.1', [0, 27, 1]],
  ['0.27.0', [0, 27, 0]],
  ['0.27', [0, 27, 0]],
  ['1.2.3', [1, 2, 3]],
  ['0.0.30', [0, 0, 30]],
];

for (const test_case of test_case_list) {
  const [version, expected] = test_case;

  test(`semver.parts("${version}") = ${expected}`, () => {
    const result = semver.parts(version);
    expect(result).toEqual(expected);
  });
}
