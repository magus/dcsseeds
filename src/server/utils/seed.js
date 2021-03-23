const { randomInt } = require('src/server/utils/random');

// DCSS seeds are 64 bit integers
// This means that the highest possible value for a seed is 2^64
// Since there is no sign on the value (always positive) this comes out to be
// 18 446 744 073 709 551 615
// This is 20 digits long but requires comparison if we random generate 20 digits
// If we pick with a max of 19 it will always be within the valid range of values
const MAX_VALID_SEED_DIGITS = 20;
const MAX_VALID_SEED = '18 446 744 073 709 551 615'; // 2^64

const _generateSeed = () => generateNum(MAX_VALID_SEED_DIGITS);
function generateSeed() {
  let seed = _generateSeed();
  while (numGreaterThan(seed, MAX_VALID_SEED)) {
    // console.debug('generateSeed', 'too high', seed);
    seed = _generateSeed();
  }

  return seed;
}

function generateNum(maxDigits = 1) {
  let digits = [];

  for (let i = 0; i < maxDigits; i++) {
    digits.push(randomInt());
  }

  return sanitizeIntegerString(digits.join(''));
}

// We could use math on array digits to figure out of a 20 digit generated is above this value
// e.g. walk the array and compare and ensure each digit is below, if not regenerate
// To test this function
// use a static value that is always greater and compare against value above
// ensure it exceeds, test with other values, etc.
function numGreaterThan(_a1, _a2) {
  // esure a1 and a2 are strings for comparing
  if (typeof _a1 !== 'string' || typeof _a2 !== 'string') {
    throw new Error(
      [
        'numGreaterThan is meant to compare integer strings',
        JSON.stringify({ _a1: _a1 || 'missing', _a2: _a2 || 'missing' }),
      ].join(' '),
    );
  }

  const a1 = sanitizeIntegerString(_a1);
  const a2 = sanitizeIntegerString(_a2);

  // easy power of 10 compare
  if (a1.length > a2.length) {
    return true;
  } else if (a2.length > a1.length) {
    return false;
  }

  // same length compare each 10s digit
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] > a2[i]) return true;
    if (a2[i] > a1[i]) return false;
  }

  // equal, return false
  // console.warn('equal', a1, a2);
  return false;
}

const LEADING_ZEROES_REGEX = /^(0+)/;
const WHITESPACE_REGEX = /\s/g;
const NON_DIGIT_REGEX = /[^0-9]/g;

function removeLeadingZeroes(num) {
  const leadingZeroMatch = num.match(LEADING_ZEROES_REGEX);
  if (leadingZeroMatch) {
    const [leadingZeroes] = leadingZeroMatch;
    if (leadingZeroes.length === num.length) {
      return '0';
    }

    return num.substring(leadingZeroes.length, num.length);
  }

  return num;
}

function sanitizeIntegerString(num) {
  num = num.replace(WHITESPACE_REGEX, '');
  num = removeLeadingZeroes(num);

  const nonDigitsMatch = num.match(NON_DIGIT_REGEX);
  if (nonDigitsMatch) {
    const [illegalCharacter] = nonDigitsMatch;
    throw new Error([num, 'contains non-digits (0-9)', illegalCharacter].join(' '));
  }

  return num;
}

module.exports = {
  generateNum,
  generateSeed,
  numGreaterThan,
  sanitizeIntegerString,
};
