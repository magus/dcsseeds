import * as React from 'react';
import styled from 'styled-components';
const USER_RAW_DATA_URL = (username) => `http://crawl.akrasiac.org/rawdata/${username}/?C=M;O=D`;

export default function Username({ inline, url, children: username }) {
  const usernameUrl = url || USER_RAW_DATA_URL(username);

  return (
    <UsernameText inline={inline} href={usernameUrl} rel="noopener" target="_blank">
      {username}
    </UsernameText>
  );
}

const UsernameText = styled.a`
  display: ${(props) => (props.inline ? 'inline-block' : 'block')};
  color: var(--blue-color);
  text-decoration: none;
  :visited {
    color: var(--blue-color);
  }
`;
