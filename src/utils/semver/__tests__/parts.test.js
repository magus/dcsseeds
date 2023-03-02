import * as semver from 'src/utils/semver';

test.each`
  string      | expected
  ${'0.27.1'} | ${[0, 27, 1]}
  ${'0.27.0'} | ${[0, 27, 0]}
  ${'0.27'}   | ${[0, 27, 0]}
  ${'1.2.3'}  | ${[1, 2, 3]}
  ${'0.0.30'} | ${[0, 0, 30]}
`('semver.parts($string) = $expected', (test_case) => {
  const result = semver.parts(test_case.string);
  expect(result).toEqual(test_case.expected);
});
