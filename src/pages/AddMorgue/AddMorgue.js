import * as React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import * as Spacer from 'src/components/Spacer';
import { Input } from 'src/components/Input';

// items            http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230226-012223.txt
// no items (skip)  http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230226-011455.txt
// error            http://crawl.akrasiac.org/rawdata/magusnn/

export default function AddMorgue() {
  const [state, patch_state] = React.useReducer(
    (state, action) => {
      return { ...state, ...action };
    },
    undefined,
    init_state,
  );

  async function handle_submit(value) {
    patch_state({ ...init_state(), loading: true });

    try {
      const api_url = new URL('/api/scrapeMorgue', window.location.origin);
      api_url.searchParams.set('morgue', value);

      const resp = await fetch(api_url);
      const json = await resp.json();
      if (json.error) {
        console.error({ json });
        throw new Error('api error');
      } else {
        const morgue_data = json.data.response.extra;
        patch_state({ loading: false, error: false, result: '✅ Success', morgue_data });
      }
    } catch (error) {
      patch_state({ loading: false, error: true, result: '❌ Invalid morgue URL' });
      console.error(error);
    }
  }

  return (
    <Container>
      <Spacer.Vertical size="2" />

      <InputContainer>
        <h1>Enter morgue URL to parse items</h1>

        <Input
          disabled={state.loading}
          type="url"
          icon="🪦"
          aria-label="Morgue URL"
          placeholder="http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20210623-085146.txt"
          onSubmit={handle_submit}
        />

        <Spacer.Vertical size="2" />

        <Result>
          <MaybeItemsLink {...state}>{state.result}</MaybeItemsLink>
        </Result>
      </InputContainer>
    </Container>
  );
}

function MaybeItemsLink(props) {
  if (props.loading) {
    return '⏳';
  }

  if (props.error || !props.result) {
    return props.children;
  }

  if (!props.morgue_data) {
    return `${props.children}, found 0 items`;
  }

  const { seed, version } = props.morgue_data;

  const items_link = {
    pathname: '/items/[version]/[seed]',
    query: { seed, version },
  };

  return (
    <Link passHref href={items_link}>
      <a rel="noopener noreferrer">
        {props.children}, found <b>{format_number.format(props.morgue_data.item_count)}</b> items
      </a>
    </Link>
  );
}

function init_state() {
  return {
    loading: false,
    error: false,
    result: null,
    morgue_data: null,
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;

const InputContainer = styled.div`
  max-width: 720px;
  width: 100%;
`;

const Result = styled.div`
  font-size: var(--font-large);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const format_number = new Intl.NumberFormat();
