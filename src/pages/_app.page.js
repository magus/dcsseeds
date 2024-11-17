import * as React from 'react';
import Head from 'next/head';
import { createGlobalStyle } from 'styled-components';

import { ThemeProvider } from '~/components/ThemeProvider';

import '~/styles/globals.css';

const TITLE = process.env.APP_NAME || '';

// Will be called once for every metric that has to be reported.
// https://nextjs.org/blog/next-9-4#integrated-web-vitals-reporting
export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  // console.debug(metric);

  // Assumes the global `gtag()` function exists, see:
  // https://developers.google.com/analytics/devguides/collection/gtagjs
  if (window.gtag) {
    const { id, name, label, value } = metric;
    window.gtag('event', name, {
      event_category: `nextjs metric (${label})`,
      // Google Analytics metrics must be integers, so the value is rounded.
      // For CLS the value is first multiplied by 1000 for greater precision
      // (note: increase the multiplier for greater precision if needed).
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      // The `id` value will be unique to the current page load. When sending
      // multiple values from the same page (e.g. for CLS), Google Analytics can
      // compute a total by grouping on this ID (note: requires `eventLabel` to
      // be a dimension in your report).
      event_label: id,
      // Use a non-interaction event to avoid affecting bounce rate.
      non_interaction: true,
    });
  }
}

export default function App(props) {
  return (
    <>
      <GlobalStyle />

      <Head>
        <meta
          key="meta-viewport"
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>{TITLE}</title>
      </Head>

      <ThemeProvider
        // force line break
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <props.Component {...props.pageProps} />
      </ThemeProvider>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  :root {
    --spacer: 8px;
    --spacer-d4: calc(var(--spacer) / 4);
    --spacer-d2: calc(var(--spacer) / 2);
    --spacer-1: var(--spacer);
    --spacer-2: calc(var(--spacer) * 2);
    --spacer-3: calc(var(--spacer) * 3);
    --spacer-4: calc(var(--spacer) * 4);
    --spacer-5: calc(var(--spacer) * 5);
    --spacer-6: calc(var(--spacer) * 6);
    --spacer-7: calc(var(--spacer) * 7);
    --spacer-8: calc(var(--spacer) * 8);
    --spacer-9: calc(var(--spacer) * 9);
    --spacer-10: calc(var(--spacer) * 10);
    --spacer-11: calc(var(--spacer) * 11);
    --spacer-12: calc(var(--spacer) * 12);
    --spacer-13: calc(var(--spacer) * 13);
    --spacer-14: calc(var(--spacer) * 14);
    --spacer-15: calc(var(--spacer) * 15);


    --font-tiny: 12px;
    --font-small: 14px;
    --font-normal: 16px;
    --font-medium: 18px;
    --font-large: 20px;
    --font-xlarge: 24px;
    --font-jumbo: 32px;

    --font-medium: 500;
    --font-bold: 700;
    --font-heavy: 800;

    --app-color: rgb(25, 174, 94);
    --app-color-light: rgb(227, 252, 236);
    --error-color: rgb(227, 52, 47);
    --gray-color-rgb: 135, 149, 161;
    --blue-color: rgb(52,144,220);
    --orange-color: rgb(246,173,85);
    --orange-color-light: rgb(254,246,236);

    --white: #fff;
    --white-rgb: 255, 255, 255;
    --gray200: rgb(248, 249, 250);
    --gray400: rgb(218,220,224);
    --gray600: rgb(88, 87, 92);
    --gray700: rgb(60, 64, 67);
    --gray800: rgb(49, 48, 53);
    --gray900: rgb(32, 33, 36);
    --gray900-rgb: 32, 33, 36;
    --black: #000;
    --black-rgb: 0, 0, 0;

    --bg-color: var(--white);
    --bg-color-rgb: var(--white-rgb);
    --divider-color: var(--gray400);
    --text-color: var(--black);
    --text-color-rgb: var(--black-rgb);
    --button-bg: var(--gray200);
    --button-border: var(--button-bg);
    --button-text: var(--gray700);
    --button-hover-shadow: var(--black-rgb);
    --button-hover-border: var(--gray400);

    @media (prefers-color-scheme: dark) {
      --bg-color: var(--black);
      --bg-color-rgb: var(--black-rgb);
      --divider-color: var(--gray400);
      --text-color: var(--white);
      --text-color-rgb: var(--white-rgb);
      --button-bg: var(--gray800);
      --button-border: var(--button-bg);
      --button-text: var(--white);
      --button-hover-shadow: var(--white-rgb);
      --button-hover-border: var(--gray600);
    }

    --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue',
      sans-serif;
    --font-size: var(--font-normal);
  }

  html,
  body {
    height: 100%;
    padding: 0;
    margin: 0;
    color: var(--text-color);
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
      Droid Sans, Helvetica Neue, sans-serif;
    background-color: var(--bg-color);
  }

  * {
    box-sizing: border-box;
  }

  button {
    margin: 0;
    padding: var(--spacer-1) var(--spacer-2);
    height: var(--spacer-6);
    vertical-align: middle;
    border: 1px solid transparent;
    border-color: var(--button-border);
    border-radius: 0.25rem;
    background-color: var(--button-bg);
    cursor: pointer;

    font-family: var(--font-family);
    font-size: var(--font-size);
    font-weight: 700;
    color: var(--button-text);
    transition: opacity,color,background-color,box-shadow,border-color 250ms ease-out;
  }

  button:hover {
    box-shadow: 0 1px 1px rgba(var(--button-hover-shadow), 0.1);
    border-color: var(--button-hover-border);
  }

  @media (prefers-color-scheme: dark) {
    button:hover {
      box-shadow: none;
    }
  }


  b {
    font-weight: var(--font-bold);
  }

  a {
    color: var(--blue-color);
    text-decoration: none;

    &:visited {
      color: var(--blue-color);
    }
  }


  #__next {
    height: 100%;
  }
`;
