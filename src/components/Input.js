import * as React from 'react';
import styled, { css } from 'styled-components';

export const Input = React.forwardRef(InputInternal);

function InputInternal(props, ref) {
  const { onChange, onSubmit, rightContent, icon, ...rest_input_props } = props;

  function handle_key_down(event) {
    const key = event.key;

    if (key === 'Enter' || key === 'Escape') {
      event.preventDefault();
    }

    if (key === 'Enter') {
      if (typeof onSubmit === 'function') {
        onSubmit(ref.current.value);
      }
    }

    if (key === 'Escape') {
      handle_clear();
    }
  }

  function handle_change(event) {
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  }

  function handle_clear() {
    if (typeof onChange === 'function') {
      onChange('');
    }
  }

  function handle_focus() {
    ref.current.select();
  }

  function handle_submit() {
    ref.current.blur();
  }

  let right_content = null;

  if (props.value) {
    right_content = <ClearIcon onClick={handle_clear}>❌</ClearIcon>;
  } else if (rightContent) {
    right_content = rightContent;
  }

  return (
    <Container>
      <InputWrapper>
        <StyledInput
          // force line break
          ref={ref}
          onFocus={handle_focus}
          onChange={handle_change}
          onKeyDown={handle_key_down}
          onSubmit={handle_submit}
          {...rest_input_props}
        />

        <Icon>{icon}</Icon>

        <RightContent>{right_content}</RightContent>
      </InputWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const InputBorder = css`
  border: 1px solid transparent;
  box-shadow: 0 1px 6px rgba(var(--text-color-rgb), 0.28);
`;

const InputBorderDark = css`
  border: 1px solid var(--gray400);
  box-shadow: none;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  height: var(--spacer-6);

  :hover {
    input {
      ${InputBorder}
    }

    @media (prefers-color-scheme: dark) {
      input {
        ${InputBorderDark}
      }
    }
  }
`;

const Icon = styled.span`
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

const StyledInput = styled.input`
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
    ${InputBorder}

    @media (prefers-color-scheme: dark) {
      ${InputBorderDark}
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
