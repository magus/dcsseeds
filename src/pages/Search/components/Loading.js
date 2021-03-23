import * as React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import { IconMessage } from 'src/components/IconMessage';

const LOADING_THRESHOLD = 1000;

export function Loading() {
  const [show, set_show] = React.useState(false);

  // on mount start timer and show loading only after LOADING_THRESHOLD
  // this prevents flashing loading when loading is faster than LOADING_THRESHOLD
  React.useEffect(() => {
    let timeoutId;

    function cleanup() {
      clearTimeout(timeoutId);
    }

    cleanup();
    timeoutId = setTimeout(() => {
      set_show(true);
    }, LOADING_THRESHOLD);

    return cleanup;
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0.25 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ease: 'easeOut', duration: 0.5 }}
    >
      <IconMessage icon="⏳" message="Loading..." />
    </motion.div>
  );
}
