import { expect, test } from 'bun:test';

// How to run these tests?
// NODE_PATH=. node src/utils/__tests__/seed.test.js

const { generateNum, generateSeed, numGreaterThan, sanitizeIntegerString } = require('../seed');

// test 0 to 100
test('numGreaterThan', () => {
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      expect(numGreaterThan(i.toString(), j.toString())).toBe(i > j);
    }
  }
});

[
  ['1000', '999', true],
  ['999', '1000', false],
  ['999', '998', true],
  ['0', '1', false],
  ['68206467482867324845', '18 446 744 073 709 551 615', true],
  ['18446744073709551616', '18446744073709551615', true],
  ['1 000 000 000 000 000 000 000 000 000 001', '1 000 000 000 000 000 000 000 000 000 000', true],
].forEach(([n1, n2, expected]) => {
  test(`${n1} > ${n2}`, () => {
    const actual = numGreaterThan(n1, n2);
    expect(actual).toBe(expected);
  });
});

[
  ['0', '0'],
  ['00', '0'],
  ['000', '0'],
  ['0001000', '1000'],
  [' 0 001 000', '1000'],
].forEach(([num, expected]) => {
  test(num, () => {
    const actual = sanitizeIntegerString(num);
    expect(actual).toBe(expected);
  });
});

test('sanitizeIntegerString throws an error when invalid seed string', () => {
  expect(() => {
    sanitizeIntegerString('0001 000 234 asdf{}| 6 23400000234605465646000');
  }).toThrow(new Error('1000234asdf{}|623400000234605465646000 contains non-digits (0-9) a'));
});

// doing 1000 iterations should ensure max digits and sanitize are respected
const MAX_DIGITS = 5;
for (let i = 0; i < 100000; i++) {
  const num = generateNum(MAX_DIGITS);

  // skip zero since it's valid
  if (num === '0') continue;

  // console.debug(`generateNum #${i}`, num);
  if (num.length > MAX_DIGITS) {
    console.error({ num, MAX_DIGITS });
    throw new Error(`generateNum #${i}: number of digits <= ${MAX_DIGITS}`);
  }
  if (num.match(/^0+/)) {
    console.error({ num });
    throw new Error(`generateNum #${i}: leading zeroes`);
  }
}

test('does not fail during iteration', () => {
  // doing iterations of generateSeed to ensure it runs well
  for (let i = 0; i < 100; i++) {
    const seed = generateSeed();
    expect(typeof seed).toBe('string');
  }
});
