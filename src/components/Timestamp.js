import * as React from 'react';
import styled from 'styled-components';

export default function Timestamp({ children: timestamp }) {
  return <TimestampText>{new Date(timestamp).toLocaleString()}</TimestampText>;
}

const TimestampText = styled.div`
  font-size: var(--font-small);
`;
