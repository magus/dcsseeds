import * as React from 'react';
import styled from 'styled-components';
import CopyButton from 'src/components/CopyButton';

export default function New(props) {
  return (
    <Container>
      <FlexColumns>
        <CopyButton>{props.seed}</CopyButton>
        <ConsoleLink href="/admin" target="_blank">
          <button>Open Console</button>
        </ConsoleLink>
      </FlexColumns>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FlexColumns = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ConsoleLink = styled.a`
  margin: 16px 0;
  font-size: 24px;
  font-weight: 400;
`;
