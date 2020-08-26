import * as React from 'react';
import { useRouter } from 'next/router';
import Compare from './Compare';
import SEOHeadTags from 'src/components/SEOHeadTags';
import withApolloClient from 'src/components/withApolloClient';

const COMPARE_TOKEN = '..';

function ComparePage(props) {
  const router = useRouter();
  const { compareSyntax } = router.query;

  const title = 'dcsseeds compare';
  let description;

  const compareProps = { playerA: undefined, playerB: undefined };

  if (compareSyntax) {
    const [playerA, playerB] = compareSyntax.split(COMPARE_TOKEN);
    if (playerA && playerB) {
      compareProps.playerA = playerA;
      compareProps.playerB = playerB;
      description = `Compare seed games of ${playerA} vs ${playerB}`;
    }
  }

  const headTagProps = { title, description };

  return (
    <React.Fragment>
      <SEOHeadTags {...headTagProps} />
      <Compare {...props} {...compareProps} />
    </React.Fragment>
  );
}

export default withApolloClient(ComparePage);
