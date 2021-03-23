// How to run these tests?
// NODE_PATH=. node src/utils/__tests__/seed.test.js

const { generateNum, generateSeed, numGreaterThan, sanitizeIntegerString } = require('../seed');

const testMeta = {
  count: 0,
  passed: [],
  failures: [],
};

function test(name, runTest, expected) {
  const data = { name, expected };

  try {
    data.result = runTest();
    if (data.result !== expected) {
      return testMeta.failures.push(data);
    }
  } catch (err) {
    data.result = err;
    if (expected instanceof Error) {
      if (expected.message !== err.message) {
        return testMeta.failures.push(data);
      }
    }
  }

  return testMeta.passed.push(data);
}

// test 0 to 100
for (let i = 0; i < 100; i++) {
  for (let j = 0; j < 100; j++) {
    test(`${i} > ${j}`, () => numGreaterThan(i.toString(), j.toString()), i > j);
  }
}

[
  ['1000', '999', true],
  ['999', '1000', false],
  ['999', '998', true],
  ['0', '1', false],
  ['68206467482867324845', '18 446 744 073 709 551 615', true],
  ['18446744073709551616', '18446744073709551615', true],
  ['1 000 000 000 000 000 000 000 000 000 001', '1 000 000 000 000 000 000 000 000 000 000', true],
].forEach(([n1, n2, expected]) => {
  test(`${n1} > ${n2}`, () => numGreaterThan(n1, n2), expected);
});

[
  ['0', '0'],
  ['00', '0'],
  ['000', '0'],
  ['0001000', '1000'],
  [' 0 001 000', '1000'],
  ['!@#', new Error('!@# contains non-digits (0-9) !')],
  [
    '0001 000 234 asdf{}| 6 23400000234605465646000',
    new Error('1000234asdf{}|623400000234605465646000 contains non-digits (0-9) a'),
  ],
].forEach(([num, expected]) => {
  test(num, () => sanitizeIntegerString(num), expected);
});

// doing 1000 iterations should ensure max digits and sanitize are respected
const MAX_DIGITS = 5;
for (let i = 0; i < 1000; i++) {
  const num = generateNum(MAX_DIGITS);
  // console.debug(`generateNum #${i}`, num);
  if (num.length > MAX_DIGITS) {
    test(`generateNum #${i}`, () => num, `number of digits <= ${MAX_DIGITS}`);
  }
  if (num.match(/^0+/)) {
    test(`generateNum #${i}`, () => num, 'leading zeroes');
  }
}

// doing iterations of generateSeed to ensure it runs well
for (let i = 0; i < 100; i++) {
  const seed = generateSeed();
  // console.debug('generateSeed', { seed });
}

if (testMeta.failures.length) {
  console.debug(testMeta.failures);
}

console.error(testMeta.failures.length, 'failures');
console.log(testMeta.passed.length, 'passed');
