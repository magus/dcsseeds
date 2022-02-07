import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

export default function Parse(props) {
  const router = useRouter();
  const { q } = router.query;
  const inputRef = React.useRef();

  function handleSubmit(event) {
    event.preventDefault();
    console.log(inputRef.current.value);
    window.open(`/api/parseMorgue?morgue=${inputRef.current.value}`);
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Input
          type="url"
          ref={inputRef}
          label="Parse morgue"
          placeholder="http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20210623-085146.txt"
        />
      </form>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;

const Input = styled.input`
  width: 100%;
  height: 100%;
  padding: var(--spacer-1) var(--spacer-6);
  border-radius: var(--spacer-3);

  font-size: var(--font-normal);
  color: var(--text-color);
  white-space: pre;

  background-color: var(--bg-color);
  border: 1px solid rgba(var(--text-color-rgb), 0.28);
  box-shadow: none;

  :hover,
  :focus {
    border: 1px solid transparent;
    box-shadow: 0 1px 6px rgba(var(--text-color-rgb), 0.28);
  }

  @media (prefers-color-scheme: dark) {
    :hover,
    :focus {
      border: 1px solid var(--gray400);
      box-shadow: none;
    }
  }

  :focus {
    outline: none;
  }
`;
