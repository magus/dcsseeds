import * as React from 'react';
import styled from 'styled-components';

export const SearchField = React.forwardRef(_SearchField);

function _SearchField(props, ref) {
  function handleKeyDown(e) {
    const key = e.key;

    if (key === 'Enter' || key === 'Escape') {
      e.preventDefault();
    }

    if (props.isDisabled) {
      return;
    }

    if (key === 'Enter') {
      if (typeof props.onSubmit === 'function') {
        props.onSubmit();
      }
    }

    if (key === 'Escape') {
      if (typeof props.onClear === 'function') {
        props.onClear();
      }
    }
  }

  function handleChange(e) {
    if (typeof props.onChange === 'function') {
      props.onChange(e.target.value);
    }
  }

  return (
    <SearchContainer>
      <Input
        ref={ref}
        aria-label={props.label}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        type="search"
        name="search"
        id="search"
        placeholder={props.placeholder}
        value={props.value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </SearchContainer>
  );
}

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  height: var(--spacer-6);
  max-width: 584px;
  padding: var(--spacer-1) var(--spacer-2);
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
