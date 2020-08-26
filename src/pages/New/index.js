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

const randomInt = (max = 9, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (array) => array[randomInt(array.length - 1)];

function generateSeed() {
  let digits = [];
  for (let i = 0; i < 20; i++) {
    digits.push(randomInt());
  }
  return digits.join('');
}

export default NewPage;
