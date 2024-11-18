import * as React from 'react';

type Dimensions = { width: number; height: number };
type Selector<T> = (_dimensions: Dimensions) => T;

export function useDimensions<T>(selector: Selector<T>): T {
  const selector_ref = React.useRef(selector);
  selector_ref.current = selector;

  const [state, set_state] = React.useState<T>(() => {
    const dimensions = get_dimensions();
    return selector_ref.current(dimensions);
  });

  React.useEffect(() => {
    window.addEventListener('resize', handler);

    return function cleanup() {
      window.removeEventListener('resize', handler);
    };

    function handler(_event: Event) {
      const next_state = selector_ref.current(get_dimensions());
      set_state(next_state);
    }
  }, []);

  return state;
}

function get_dimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
