import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

export function RandomSearchCTA(props) {
  const router = useRouter();

  // hide cta when artifact filter is active
  if (router.query.a) {
    return null;
  }

  return <Button onClick={props.onClick}>🎲</Button>;
}

const Button = styled.button`
  --font-size: var(--font-xlarge);
  --button-bg: transparent;
  --button-border: transparent;
  --button-hover-border: transparent;
`;
