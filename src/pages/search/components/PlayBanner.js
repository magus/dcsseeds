import * as React from 'react';
import styled from 'styled-components';

export function PlayBanner() {
  const [visible, set_visible] = React.useState(false);

  React.useEffect(() => {
    try {
      set_visible(sessionStorage.getItem('play_banner_dismissed') !== 'true');
    } catch {
      set_visible(true);
    }
  }, []);

  function dismiss() {
    set_visible(false);

    try {
      sessionStorage.setItem('play_banner_dismissed', 'true');
    } catch {
      // Dismiss for this page even when browser storage is unavailable.
    }
  }

  if (!visible) return null;

  return (
    <Banner aria-label="Web client invitation">
      <Content>
        <a href="/play" target="_blank" rel="noopener">
          Play DCSS on your phone ↗
        </a>
        <DismissButton type="button" aria-label="Dismiss web client invitation" onClick={dismiss}>
          ×
        </DismissButton>
      </Content>
    </Banner>
  );
}

const Banner = styled.aside`
  background: var(--app-color);
  font-size: var(--font-small);
  color: var(--black);

  a,
  a:visited {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Content = styled.div`
  max-width: 752px;
  margin: 0 auto;
  padding: var(--spacer-d2) var(--spacer-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer-2);
`;

const DismissButton = styled.button`
  flex-shrink: 0;
  height: 36px;
  width: 36px;
  padding: 0;
  background: transparent;
  border-color: transparent;
  font-size: var(--font-large);
  font-weight: normal;
  color: inherit;
`;
