import * as React from 'react';
import styled, { css } from 'styled-components';

export const Input = React.forwardRef(InputInternal);

function InputInternal(props, ref) {
  const { onChange, onSubmit, rightContent, icon, ...rest_input_props } = props;

  const local_input_ref = React.useRef();
  const input_ref = ref || local_input_ref;
  const [local_value, set_local_value] = React.useState('');

  function handle_key_down(event) {
    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();
      handle_submit();
    }

    if (key === 'Escape') {
      event.preventDefault();
      handle_clear();
    }
  }

  function handle_change(event) {
    const text = event.target.value;

    if (typeof onChange === 'function') {
      onChange(text);
    } else {
      set_local_value(text);
    }
  }

  function handle_clear() {
    if (typeof onChange === 'function') {
      onChange('');
    } else {
      input_ref.current.value = '';
      set_local_value('');
    }
  }

  function handle_focus() {
    input_ref.current.select();
  }

  function handle_submit() {
    input_ref.current.blur();

    if (typeof onSubmit === 'function') {
      onSubmit(input_ref.current.value);
    }
  }

  let right_content = null;

  if (props.value || input_ref.current?.value) {
    right_content = <ClearIcon onClick={handle_clear}>❌</ClearIcon>;
  } else if (rightContent) {
    right_content = rightContent;
  }

  return (
    <Container>
      <InputWrapper>
        <StyledInput
          // force line break
          ref={input_ref}
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
  width: 100%;
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
