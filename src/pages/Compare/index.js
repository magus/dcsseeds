import { useRouter } from 'next/router';
import Compare from './Compare';
import Page from 'src/components/Page';

// https://regexr.com/5cs4j
const COMPARE_TOKEN_REGEX = /^([^\.]*?)\.{2,3}([^\.]*)$/;

function getPlayers(router) {
  const { playerA, playerB } = router.query;

  const tokenMatch = playerA.match(COMPARE_TOKEN_REGEX);

  if (tokenMatch) {
    const [, _pA, _pB] = tokenMatch;
    return [_pA, _pB];
  } else {
    return [playerA, playerB];
  }
}

export default function ComparePage(props) {
  const router = useRouter();
  const [playerA, playerB] = getPlayers(router);

  let title = 'Compare DCSS seed games of players';

  if (playerA && playerB) {
    title = `Compare DCSS seed games of ${playerA} vs ${playerB}`;
  }

  const headTagProps = { title, description: title };
  const InternalComparePage = Page(Compare, { headTagProps, withApollo: true });

  // console.warn({ headTagProps });

  return <InternalComparePage {...props} {...{ playerA, playerB }} />;
}

// Defining getInitialProps will force SSR for metatags
// If removed, router.query is `{}` and we never populate description meta tag
ComparePage.getInitialProps = async (ctx) => {
  // console.warn({ ctx });
  return {};
};
