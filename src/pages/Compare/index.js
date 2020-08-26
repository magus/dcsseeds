import { useRouter } from 'next/router';
import Compare from './Compare';
import Page from 'src/components/Page';

const COMPARE_TOKEN = '..';

export default function ComparePage(props) {
  const router = useRouter();
  const { compareSyntax } = router.query;

  const title = 'dcsseeds compare';
  let description;

  const forwardProps = { playerA: undefined, playerB: undefined };

  if (compareSyntax) {
    const [playerA, playerB] = compareSyntax.split(COMPARE_TOKEN);
    if (playerA && playerB) {
      forwardProps.playerA = playerA;
      forwardProps.playerB = playerB;
      description = `Compare seed games of ${playerA} vs ${playerB}`;
    }
  }

  const headTagProps = { title, description };
  const InternalComparePage = Page({ Component: Compare, headTagProps, withApollo: true });

  // console.warn({ headTagProps });

  return <InternalComparePage {...props} {...forwardProps} />;
}

// Defining getInitialProps will force SSR for metatags
// If removed, router.query is `{}` and we never populate description meta tag
ComparePage.getInitialProps = async (ctx) => {
  // console.warn({ ctx });
  return {};
};
