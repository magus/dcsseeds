import * as React from 'react';
import styled from 'styled-components';

export default function CopyButton({ children: text }) {
  const instance = React.useRef({
    ref: React.createRef(),
    width: null,
  });
  const [copied, set_copied] = React.useState(false);

  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);

      instance.current.width = instance.current.ref.current.offsetWidth;
      set_copied(true);
    }
  }

  React.useEffect(() => {
    let timeoutId;

    function cleanup() {
      clearTimeout(timeoutId);
    }

    if (copied) {
      cleanup();
      timeoutId = setTimeout(() => {
        set_copied(false);
      }, 2000);
    }

    return cleanup;
  }, [copied]);

  const { width } = instance.current;

  return (
    <Button ref={instance.current.ref} onClick={handleClick} style={{ width }}>
      {copied ? 'Copied!' : text}
    </Button>
  );
}

const Button = styled.button`
  font-variant: tabular-nums;
`;
