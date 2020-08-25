import * as React from 'react';
import styled from 'styled-components';
const USER_RAW_DATA_URL = (username) => `http://crawl.akrasiac.org/rawdata/${username}/?C=M;O=D`;

export default function Username({ children: username }) {
  return (
    <UsernameText href={USER_RAW_DATA_URL(username)} target="_blank">
      {username}
    </UsernameText>
  );
}

const UsernameText = styled.a`
  color: var(--blue-color);
  text-decoration: none;
  :visited {
    color: var(--blue-color);
  }
`;
