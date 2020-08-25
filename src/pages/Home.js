import * as React from 'react';
import styled from 'styled-components';

import CopyButton from 'src/components/CopyButton';

const randomInt = (max = 9, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateSeed() {
  let digits = [];
  for (let i = 0; i < 20; i++) {
    digits.push(randomInt());
  }
  return digits.join('');
}

export default function Home(props) {
  return (
    <Container>
      <CopyButton>{props.seed}</CopyButton>
    </Container>
  );
}

Home.getInitialProps = async () => {
  const seed = generateSeed();

  return { seed };
};

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
