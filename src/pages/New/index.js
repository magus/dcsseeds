import crypto from 'crypto';
import New from './New';
import Page from 'src/components/Page';
import Species from 'src/utils/Species';
import Backgrounds from 'src/utils/Backgrounds';

const NewPage = Page(New, { withApollo: false });

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

function generateSeed() {
  let digits = [];
  for (let i = 0; i < 20; i++) {
    digits.push(randomInt());
  }
  return digits.join('');
}

export default NewPage;
