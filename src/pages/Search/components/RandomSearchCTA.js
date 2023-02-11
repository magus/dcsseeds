import * as React from 'react';
import { useRouter } from 'next/router';

import { IconMessage } from 'src/components/IconMessage';

export function RandomSearchCTA(props) {
  const router = useRouter();

  // hide cta when artifact filter is active
  if (router.query.a) {
    return null;
  }

  if (props.search) {
    return null;
  }

  return (
    <IconMessage
      // force line break
      icon="👋"
      message="Click here for a random search..."
      onMessageClick={props.onTrySearch}
    />
  );
}
