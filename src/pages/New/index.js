import crypto from 'crypto';
import New from './New';
import Page from 'src/components/Page';
import Species from 'src/utils/Species';
import Backgrounds from 'src/utils/Backgrounds';

const NewPage = Page(New, { withApollo: true });

NewPage.getInitialProps = async () => {
  const seed = generateSeed();
  const species = randomElement(Object.values(Species.Names));
  const background = randomElement(Object.values(Backgrounds.Names));

  return { background, species, seed };
};

const MAX_INT8 = Math.pow(2, 8) - 1;
const random = () => {
  const [randInt8] = crypto.randomBytes(1).toJSON().data;
  return randInt8 / MAX_INT8;
};
const randomInt = (max = 9, min = 0) => Math.floor(random() * (max - min + 1)) + min;
const randomElement = (array) => array[randomInt(array.length - 1)];

// DCSS seeds are 64 bit integers
// This means that the highest possible value for a seed is 2^64
// with sign this goes down to 2^63 ~ 9,223,372,036,854,775,807
// This is 19 digits long, so if we generate a value with 18
// digits we should always be within the valid range for seeds
const MAX_DIGITS = 18;

function generateSeed() {
  let digits = [];
  for (let i = 0; i < MAX_DIGITS; i++) {
    digits.push(randomInt());
  }

  const joinedDigits = digits.join('');
  // remove preceding zeros to make it a valid integer
  const seed = joinedDigits.replace(LEADING_ZEROES_REGEX, '');
  return seed;
}

const LEADING_ZEROES_REGEX = /^(0+)/;

export default NewPage;
