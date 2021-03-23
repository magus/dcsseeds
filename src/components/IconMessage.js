import * as React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export function IconMessage(props) {
  return (
    <Container>
      <Icon>{props.icon}</Icon>
      <Message onClick={props.onMessageClick}>{props.message}</Message>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.div`
  font-size: 48px;
`;

const Message = styled.div`
  font-size: var(--font-large);
  font-weight: var(--font-heavy);
  text-align: center;
  ${(props) => (!props.onClick ? '' : 'color: var(--blue-color);')}
`;
