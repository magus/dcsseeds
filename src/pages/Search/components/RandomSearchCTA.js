import * as React from 'react';
import { IconMessage } from 'src/components/IconMessage';

export function RandomSearchCTA(props) {
  if (props.search) {
    return null;
  }

  return <IconMessage icon="👋" message="Click here for a random search..." onMessageClick={props.onTrySearch} />;
}
