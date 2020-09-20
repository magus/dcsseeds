import { useRouter } from 'next/router';
import Compare from './Compare';
import Page from 'src/components/Page';

const COMPARE_TOKEN = '..';

function getPlayers(router) {
  const { playerA, playerB } = router.query;

  // console.warn({ playerA, playerB });

  if (!!~playerA.indexOf(COMPARE_TOKEN)) {
    const [_pA, _pB] = playerA.split(COMPARE_TOKEN);
    return [_pA, _pB];
  } else {
    return [playerA, playerB];
  }
}

export default function ComparePage(props) {
  const router = useRouter();
  const [playerA, playerB] = getPlayers(router);

  const title = 'dcsseeds compare';
  let description = 'Compare seed games of players';

  if (playerA && playerB) {
    description = `Compare seed games of ${playerA} vs ${playerB}`;
  }

  const headTagProps = { title, description };
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
