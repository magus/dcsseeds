import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import { useArtifactFilter } from 'src/graphql/useArtifactFilter';
import { ArtifactSearchResult } from './ArtifactSearchResult';
import * as Unrands from 'src/utils/Unrands';

import * as Spacer from 'src/components/Spacer';

export function ArtifactSearch(props) {
  const artifact_filter = useSyncArtifactFilter(props);

  return (
    <Container>
      <ArtifactFilters {...artifact_filter} />

      <Spacer.Vertical size="2" />

      <ResultsContainer>
        <ArtifactResults {...artifact_filter} />
      </ResultsContainer>
    </Container>
  );
}

function ArtifactResults(props) {
  const { result_list } = props;

  return props.result_list.map((result, i) => {
    const key = [result.seed, result.version].join('-');
    return (
      <motion.div
        // force line break
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        layout
      >
        <ArtifactSearchResult {...result} />
      </motion.div>
    );
    return;
  });
}

function ArtifactFilterButton(props) {
  const count = props.artifact_count[props.i];

  function handle_click() {
    // console.debug({ name, i });
    if (count === 0) return;

    if (props.active) {
      props.remove_filter(props.i);
    } else {
      props.add_filter(props.i);
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  if (count === 0) {
    return null;
  }

  return (
    <ButtonGroup
      key={props.name}
      // force line break
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
    >
      <Button active={props.active} disabled={props.disabled} count={count} onClick={handle_click}>
        {props.name} ({count})
      </Button>
    </ButtonGroup>
  );
}

function ArtifactFilters(props) {
  let active_buttons = [];
  let inactive_buttons = [];

  for (let i = 0; i < Unrands.List.length; i++) {
    const name = Unrands.List[i];
    const active = props.filter_set.has(i);

    const button = (
      <ArtifactFilterButton
        // force line break
        key={name}
        {...props}
        disabled={props.loading}
        name={name}
        active={active}
        i={i}
      />
    );

    if (active) {
      active_buttons.push(button);
    } else {
      inactive_buttons.push(button);
    }
  }

  return (
    <Filters>
      {props.filter_set.size === 0 ? null : (
        <ButtonGroup>
          <Button onClick={props.reset}>❌ Clear</Button>
        </ButtonGroup>
      )}

      {active_buttons}
      {inactive_buttons}
    </Filters>
  );
}

function useSyncArtifactFilter(props) {
  const router = useRouter();

  const artifact_filter = useArtifactFilter(props);
  // console.debug('[artifact_filter]', artifact_filter);

  const filter_list = Array.from(artifact_filter.filter_set);
  filter_list.sort();
  const filter_list_key = filter_list.join('');

  React.useEffect(() => {
    if (!router.isReady) return;

    let artifact_list = router.query.a;

    if (artifact_list) {
      // ensure it's always an array
      if (!Array.isArray(artifact_list)) {
        artifact_list = [artifact_list];
      }

      const filter_list = [];

      for (const name of artifact_list) {
        const i = Unrands.NameIndex[name];
        if (typeof i === 'number') {
          filter_list.push(i);
        }
      }

      artifact_filter.init_filter_list(filter_list);
    }

    // intentionally run once after router is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // sync url with artifact filters
  React.useEffect(() => {
    const url = {};
    url.pathname = router.pathname;

    if (artifact_filter.filter_set) {
      const names = filter_list.map((i) => Unrands.List[i]);
      url.query = {
        // ensure we do not clear other query params
        ...router.query,
        a: names,
      };
    }

    // // Shallow routing allows you to change the URL without running data fetching methods again,
    // // that includes getServerSideProps, getStaticProps, and getInitialProps.
    // // https://nextjs.org/docs/routing/shallow-routing
    router.replace(url, undefined, { shallow: true });

    // intentionally run only when filter set changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter_list_key]);

  return artifact_filter;
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 720px;
  width: 100%;
`;

const Filters = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  flex-grow: 1;
  margin: 0 var(--spacer-d2) var(--spacer-d2) 0;
`;

const Button = styled.button`
  flex-grow: 1;
  font-size: var(--font-small);
  padding: var(--spacer-d2) var(--spacer-1);
  height: auto;
  transition: opacity, color, background-color 0.2s ease-out;

  opacity: ${(props) => (props.disabled ? 0.4 : 1.0)};

  ${(props) => {
    switch (true) {
      case props.active:
        return css`
          background-color: rgb(21, 128, 61);
          color: rgb(220, 252, 231);
        `;
      case props.count === 0:
        return css`
          background-color: #171717;
          color: #404040;
        `;
      default:
        return '';
    }
  }}
`;
