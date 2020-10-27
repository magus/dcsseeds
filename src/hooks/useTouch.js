import * as React from 'react';

export default function useTouch() {
  const [touch, set_touch] = React.useState(true);
  const instance = React.useRef({ lastTouch: 0 });

  React.useEffect(() => {
    function handleTouch() {
      instance.current.lastTouch = Date.now();
    }

    function handleMouseMove() {
      const timeSinceLastTouch = Date.now() - instance.current.lastTouch;

      if (timeSinceLastTouch > 1000) {
        set_touch(false);
      } else {
        set_touch(true);
      }
    }

    function cleanup() {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('touchend', handleTouch);
      document.removeEventListener('mousemove', handleMouseMove);
    }

    if (document) {
      document.addEventListener('touchstart', handleTouch);
      document.addEventListener('touchend', handleTouch);
      document.addEventListener('mousemove', handleMouseMove);
    }

    return cleanup;
  });

  return React.useMemo(() => {
    console.info('useTouch', { touch });
    return touch;
  }, [touch]);
}
