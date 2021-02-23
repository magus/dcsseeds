import Head from 'next/head';
import styled, { createGlobalStyle } from 'styled-components';
import App from 'next/app';
import sentryConfig from 'src/sentry/config';

const TITLE = process.env.APP_NAME || '';

const { Sentry, captureException } = sentryConfig();

if (process.browser) {
  window.addEventListener('error', (event) => {
    captureException(event.error, { errorSource: 'browser.window.error' });
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
    const errorEventId = captureException(error, {
      errorInfo,
      errorSource: 'componentDidCatch',
    });

    // Store the event id at this point as we don't have access to it within
    // `getDerivedStateFromError`.
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
    --app-color: rgb(25, 174, 94);
    --app-color-light: rgb(227, 252, 236);
    --error-color: rgb(227, 52, 47);
    --gray-color-rgb: 135, 149, 161;
    --blue-color: rgb(52,144,220);

    --bg-color: #fff;
    --font-color-rgb: 26, 32, 44;
    --font-color: rgb(26, 32, 44);
    --button-color: rgb(226, 232, 240);
    --button-border-color: rgb(226, 232, 240);
    --button-text: rgb(45, 55, 72);

    @media (prefers-color-scheme: dark) {
      --bg-color: #000;
      --font-color-rgb: 255, 255, 255;
      --font-color: rgb(255, 255, 255);
      --button-color: rgb(34,41,47);
      --button-border-color: rgb(226, 232, 240);
      --button-text: #fff;
    }

    --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue',
      sans-serif;
    --font-size: 16px;
  }

  html,
  body {
    height: 100%;
    padding: 0;
    margin: 0;
    color: var(--font-color);
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
      Droid Sans, Helvetica Neue, sans-serif;
    background-color: var(--bg-color);
  }

  * {
    box-sizing: border-box;
  }

  button {
    margin: 0;
    padding: 0.5rem 1rem;
    height: 46px;
    vertical-align: middle;
    border: 1px solid transparent;
    border-color: var(--button-border-color);
    border-radius: 0.25rem;
    background-color: var(--button-color);
    cursor: pointer;

    font-family: var(--font-family);
    font-size: var(--font-size);
    font-weight: 700;
    color: var(--button-text);
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
