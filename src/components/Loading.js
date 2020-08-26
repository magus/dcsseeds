import * as React from 'react';
import styled from 'styled-components';

export default function Loading() {
  return <LoadingText>Loading...</LoadingText>;
}

const LoadingText = styled.div`
  font-size: 48px;
  font-weight: 800;
`;
