import * as React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

export default function CopyButton(props) {
  const text = props.children;
  const copy = props.copy || text;
  const copyMessage = props.copyMessage || COPIED;
  const title = props.title || 'Click to copy';

  const instance = React.useRef({
    ref: React.createRef(),
    width: null,
  });
  const [copied, set_copied] = React.useState(false);

  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copy);

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
  const displayText = !props.tooltip && copied ? copyMessage : text;

  return (
    <Button ref={instance.current.ref} title={title} onClick={handleClick} style={{ width }}>
      {displayText}

      {!props.tooltip ? null : (
        <Tooltip>
          <AnimatePresence>
            {!copied ? null : (
              <TooltipContent
                initial={{ x: -1 * width, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -1 * (width / 2), opacity: 0 }}
              >
                {copyMessage}
              </TooltipContent>
            )}
          </AnimatePresence>
        </Tooltip>
      )}
    </Button>
  );
}

const COPIED = '📋 Copied!';

const Button = styled.button`
  position: relative;
  font-variant: tabular-nums;
`;

const Tooltip = styled.div`
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
`;

const TooltipContent = styled(motion.div)`
  position: relative;
  background-color: var(--gray900);
  padding: var(--spacer-1);
  white-space: nowrap;
`;
