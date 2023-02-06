import * as React from 'react';
import Head from 'next/head';
import styled, { createGlobalStyle } from 'styled-components';
import App from 'next/app';
import sentryConfig from 'src/sentry/config';

const TITLE = process.env.APP_NAME || '';

const { Sentry, captureException } = sentryConfig();

if (process.browser) {
  window.addEventListener('error', (event) => {
    console.debug('[SentryConfig]', 'window.error', { event });
    captureException(event.error, { errorSource: 'browser.window.error' });

    // prevent bubbling to the Sentry.Integration.TryCatch
    // handler which wraps all `addEventListener` functions
    event.stopPropagation();
  });
}

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

export default class MyApp extends App {
  static getDerivedStateFromProps(props, state) {
    // If there was an error generated within getInitialProps, and we haven't
    // yet seen an error, we add it to this.state here
    return {
      hasError: props.hasError || state.hasError || false,
      errorEventId: props.errorEventId || state.errorEventId || undefined,
    };
  }

  static getDerivedStateFromError() {
    // React Error Boundary here allows us to set state flagging the error (and
    // later render a fallback UI).
    return { hasError: true };
  }

  constructor() {
    super(...arguments);

    this.state = {
      hasError: false,
      errorEventId: undefined,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.debug('componentDidCatch');

    const errorEventId = captureException(error, {
      errorInfo,
      errorSource: 'componentDidCatch',
    });

    // Store the event id at this point as we don't have access to it within
    // `getDerivedStateFromError`.
    // `SentryConfig.Sentry.showReportDialog` can be used to manually send errors
    // e.g. SentryConfig.Sentry.showReportDialog({ eventId: this.state.errorEventId });
    this.setState({ errorEventId });
  }

  componentDidMount() {
    window.addEventListener('error', (event) => {
      captureException(event.error, { errorSource: 'browser._app.window.error' });
    });
  }

  render() {
    const { Component, pageProps } = this.props;

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

        {this.state.hasError ? (
          <Container>
            <div>
              <H1>Sorry, something went wrong.</H1>
              <Options>
                <Choice
                  onClick={() => {
                    Sentry.showReportDialog({ eventId: this.state.errorEventId });
                  }}
                >
                  Report
                </Choice>
                <Choice
                  onClick={() => {
                    window.location.reload(true);
                  }}
                >
                  Reload
                </Choice>
              </Options>
            </div>
          </Container>
        ) : (
          <Component {...pageProps} />
        )}
      </>
    );
  }
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   try {
//     // calls page's `getInitialProps` and fills `appProps.pageProps`
//     const appProps = await App.getInitialProps(appContext);

//     return { ...appProps };
//   } catch (error) {
//     // Capture errors that happen during a page's getInitialProps.
//     // This will work on both client and server sides.
//     const errorEventId = captureException(error, ctx);
//     return {
//       hasError: true,
//       errorEventId,
//     };
//   }
// };

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

    --font-small: 14px;
    --font-normal: 16px;
    --font-medium: 18px;
    --font-large: 20px;

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
    --button-border: var(--gray200);
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
      --button-border: var(--gray800);
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
  }

  button:hover {
    box-shadow: 0 1px 1px rgba(var(--button-hover-shadow), 0.1);
    border: 1px solid var(--button-hover-border);
  }

  @media (prefers-color-scheme: dark) {
    button:hover {
      box-shadow: none;
    }
  }


  #__next {
    height: 100%;
  }
`;

const Container = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, Roboto, 'Segoe UI', 'Fira Sans', Avenir, 'Helvetica Neue',
    'Lucida Grande', sans-serif;
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const H1 = styled.h1`
  display: inline-block;
  margin: 0;
  padding: 10px 0;
  font-size: 24px;
  font-weight: 500;
  vertical-align: top;
`;

const Options = styled.div`
  display: flex;
  justify-content: center;
`;

const Choice = styled.button`
  margin: 0 8px;
`;
