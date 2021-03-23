import * as React from 'react';
import styled from 'styled-components';

export function SearchResult({ search, result }) {
  const otherItemCount = result.morgue.items.aggregate.count - 1;

  return (
    <SearchResultContainer>
      <Item>
        <Highlight match={search}>{result.item.name}</Highlight>
      </Item>

      <Spacer />

      <BottomRow>
        <BottomLeft>
          <Small>{result.location}</Small>
        </BottomLeft>

        <BottomRight>
          <MorgueLink href={result.morgue.url} rel="noopener" target="_blank">
            <OtherItems>
              {!otherItemCount ? null : (
                <Small>
                  +{otherItemCount} other item{otherItemCount === 1 ? '' : 's'}
                </Small>
              )}
            </OtherItems>
            <Player>{result.morgue.player.name}</Player>
            {' · '}
            <Small>{result.seed.version}</Small>
          </MorgueLink>
        </BottomRight>
      </BottomRow>
    </SearchResultContainer>
  );
}

// highlight match (props.match) in text (props.children)
function Highlight(props) {
  const text = props.children;

  if (typeof text !== 'string' || typeof props.match !== 'string' || props.match.length < 1) {
    return text;
  }

  const re = new RegExp(props.match, 'ig');

  // split text into parts for displaying highlights
  const parts = [];

  // find all matches in children
  let iterations = 0;
  let index = 0;
  let match = re.exec(text);
  while (match) {
    if (iterations > text.length) {
      // prevent degenerate case where we match more than
      // there are characters in the text
      console.error('[Hightlight]', 'too many iterations, exiting');
      return text;
    }
    if (index !== match.index) {
      parts.push({
        type: 'normal',
        value: text.substring(index, match.index),
      });
    }

    parts.push({
      type: 'match',
      value: text.substr(match.index, props.match.length),
    });

    index = match.index + props.match.length;
    match = re.exec(text);
    iterations++;
  }
  if (index < text.length) {
    parts.push({
      type: 'normal',
      value: text.substring(index, text.length),
    });
  }

  return (
    <span>
      {parts.map((part, i) => {
        switch (part.type) {
          case 'match':
            return <Match key={i}>{part.value}</Match>;
          case 'normal':
          default:
            return <span key={i}>{part.value}</span>;
        }
      })}
    </span>
  );
}

const SearchResultContainer = styled.div`
  width: 100%;
  margin: var(--spacer-1) 0;
  padding: var(--spacer-4);
  border-radius: var(--spacer-1);
  background-color: var(--button-bg);
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  font-size: var(--font-large);
  text-align: left;
`;

const Spacer = styled.div`
  height: var(--spacer-2);
  width: 100%;
`;

const Small = styled.span`
  font-size: var(--font-small);
`;

const Player = styled(Small)`
  font-size: var(--font-small);
`;

const Match = styled.span`
  font-weight: var(--font-heavy);
  color: var(--orange-color);
  background-color: var(--orange-color-light);
`;

const Json = styled.div`
  white-space: pre-wrap;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const BottomLeft = styled.div`
  align-self: flex-end;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const BottomRight = styled.div`
  align-self: flex-end;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const MorgueLink = styled.a`
  color: var(--blue-color);
  text-decoration: none;
  :visited {
    color: var(--blue-color);
  }
`;

const OtherItems = styled.div`
  text-align: right;
`;
