import * as React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export function IconMessage(props) {
  return (
    <Container>
      <Icon>{props.icon}</Icon>
      {props.onMessageClick ? (
        <MessageButton onClick={props.onMessageClick}>
          <Message>{props.message}</Message>
        </MessageButton>
      ) : (
        <Message>{props.message}</Message>
      )}
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
`;

const MessageButton = styled.button`
  height: auto;

  /* reset button styles */
  background-color: transparent;
  border: none;
  :hover {
    background-color: transparent;
    border: none;
  }

  cursor: pointer;
  ${(props) => (!props.onClick ? '' : 'color: var(--blue-color);')}
`;
