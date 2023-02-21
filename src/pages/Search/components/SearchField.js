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

  function handle_focus() {
    ref.current.select();
  }

  let right_content = null;

  if (props.value) {
    right_content = <ClearIcon onClick={props.onClear}>❌</ClearIcon>;
  } else if (props.right) {
    right_content = props.right;
  }

  return (
    <SearchContainer>
      <SearchBar>
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
          onFocus={handle_focus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <SearchIcon>🔎</SearchIcon>

        <RightContent>{right_content}</RightContent>
      </SearchBar>
    </SearchContainer>
  );
}

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  height: var(--spacer-6);
`;

const SearchIcon = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--spacer-6);
  padding: 0 0 0 var(--spacer-2);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: var(--font-large);
`;

const RightContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
`;

const ClearIcon = styled.button`
  /* reset button styles */
  background-color: transparent;
  border: none;
  :hover {
    background-color: transparent;
    border: none;
  }

  height: 100%;
  width: var(--spacer-6);
  padding: 0 var(--spacer-2) 0 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: var(--font-large);
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

  /* reset webkit search field appearance */
  -webkit-appearance: textfield;
  ::-webkit-search-cancel-button {
    display: none;
  }
`;
