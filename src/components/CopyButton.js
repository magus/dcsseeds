import * as React from 'react';
import styled from 'styled-components';

export default function CopyButton({ children }) {
  const instance = React.useRef({
    ref: React.createRef(),
    width: null,
  });
  const [copied, set_copied] = React.useState(false);

  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(children);

      instance.current.width = instance.current.ref.current.offsetWidth;
      set_copied(true);
    }
  }

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => {
        set_copied(false);
      }, 2000);
    }
  }, [copied]);

  const { width } = instance.current;

  return (
    <Button ref={instance.current.ref} onClick={handleClick} style={{ width }}>
      {copied ? 'Copied!' : children}
    </Button>
  );
}

const Button = styled.button`
  font-variant: tabular-nums;
`;
