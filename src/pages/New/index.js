import * as React from 'react';
import New from './New';
import SEOHeadTags from 'src/components/SEOHeadTags';
import withApolloClient from 'src/components/withApolloClient';

function NewPage(props) {
  return (
    <React.Fragment>
      <SEOHeadTags />
      <New {...props} />
    </React.Fragment>
  );
}

const randomInt = (max = 9, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateSeed() {
  let digits = [];
  for (let i = 0; i < 20; i++) {
    digits.push(randomInt());
  }
  return digits.join('');
}

const NewPageWithApollo = withApolloClient(NewPage);

NewPageWithApollo.getInitialProps = async () => {
  const seed = generateSeed();

  return { seed };
};

export default NewPageWithApollo;
