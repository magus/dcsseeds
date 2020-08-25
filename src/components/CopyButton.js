import * as React from 'react';
import styled from 'styled-components';

export default function CopyButton({ children }) {
  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(children);
    }
  }

  return <Button onClick={handleClick}>{children}</Button>;
}

const Button = styled.button`
  font-variant: tabular-nums;
`;
