export function top() {
  return to(0);
}

export function to(top) {
  return new Promise((resolve, reject) => {
    const scrollTop = window.scrollY || window.document.documentElement.scrollTop || window.document.body.scrollTop;

    if (scrollTop === top) {
      // immediately resolve if window already at top of frame
      return resolve();
    }

    let timeoutId;

    function delay_cleanup(source) {
      // keep clearing timeout
      // fire timeout if events more than 100ms apart
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => cleanup(source), 100);
    }

    function cleanup(source) {
      window.removeEventListener('scroll', delay_cleanup);

      if (source instanceof Error) {
        return reject(source);
      }

      resolve();
    }

    window.addEventListener('scroll', delay_cleanup);

    // wait for animation frame to ensure this scroll executes
    // removing the `requestAnimationFrame` will cause the `scrollTo`
    // to appear to be a noop and do nothing, default chrome behavior
    requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: 'smooth' });
    });

    // remove listener if scroll does not fire within 100ms
    delay_cleanup(new Error('Error window.scrollTo never fired.'));
  });
}
