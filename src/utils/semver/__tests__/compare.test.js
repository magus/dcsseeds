import * as semver from 'src/utils/semver';

test.each`
  a           | b           | expected
  ${'0.27.1'} | ${'0.27.1'} | ${0}
  ${'0.27.1'} | ${'0.27.0'} | ${+1}
  ${'0.27.1'} | ${'0.27'}   | ${+1}
  ${'0.27.0'} | ${'0.27.1'} | ${-1}
  ${'0.27'}   | ${'0.27.1'} | ${-1}
  ${'0.28.0'} | ${'0.27.1'} | ${+1}
  ${'0.26.0'} | ${'0.27.1'} | ${-1}
  ${'1.2.0'}  | ${'0.27.1'} | ${+1}
  ${'0.0.30'} | ${'0.27.1'} | ${-1}
`('semver.compare($a, $b) = $expected', (test_case) => {
  const result = semver.compare(test_case.a, test_case.b);
  expect(result).toBe(test_case.expected);
});
