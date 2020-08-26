import New from './New';
import Page from 'src/components/Page';

const NewPage = Page({ Component: New, withApollo: false });

NewPage.getInitialProps = async () => {
  const seed = generateSeed();

  return { seed };
};

const randomInt = (max = 9, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateSeed() {
  let digits = [];
  for (let i = 0; i < 20; i++) {
    digits.push(randomInt());
  }
  return digits.join('');
}

export default NewPage;
