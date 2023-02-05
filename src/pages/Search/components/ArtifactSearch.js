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
        layout="position"
      >
        <ArtifactSearchResult {...result} />
      </motion.div>
    );
    return;
  });
}

function ArtifactFilterButton(props) {
  const count = props.artifact_count[props.unrand_key];

  function handle_click() {
    // console.debug({ name, i });
    if (count === 0) return;

    if (props.active) {
      props.remove_filter(props.unrand_key);
    } else {
      props.add_filter(props.unrand_key);
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
      layout="position"
    >
      <Button active={props.active} disabled={props.disabled} count={count} onClick={handle_click}>
        {props.name} ({count})
      </Button>
    </ButtonGroup>
  );
}

function ArtifactFilters(props) {
  const router = useRouter();

  let button_list = [];

  const search = router.query.q;

  const active_key_list = Array.from(props.filter_set);

  const inactive_key_list = [];
  for (let i = 0; i < Unrands.List.length; i++) {
    if (!props.filter_set.has(i)) {
      inactive_key_list.push(i);
    }
  }

  const filter_unrand_key_list = active_key_list.concat(inactive_key_list);

  for (let i = 0; i < filter_unrand_key_list.length; i++) {
    const unrand_key = filter_unrand_key_list[i];
    const name = Unrands.List[unrand_key];
    const active = props.filter_set.has(unrand_key);

    const button = (
      <ArtifactFilterButton
        // force line break
        key={unrand_key}
        {...props}
        disabled={props.loading}
        name={name}
        active={active}
        unrand_key={unrand_key}
      />
    );

    if (active) {
      button_list.push(button);
    } else {
      // skip filters that do not match active search
      if (search && !name.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }

      button_list.push(button);
    }
  }

  return (
    <Filters>
      {props.filter_set.size === 0 ? null : (
        <ButtonGroup>
          <Button onClick={props.reset}>❌ Clear</Button>
        </ButtonGroup>
      )}

      {button_list}
    </Filters>
  );
}

function useSyncArtifactFilter(props) {
  const router = useRouter();

  const artifact_filter = useArtifactFilter(props);
  // console.debug('[artifact_filter]', artifact_filter);

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
      const names = Array.from(artifact_filter.filter_set).map((i) => Unrands.List[i]);
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
  }, [artifact_filter.filter_list_key]);

  return artifact_filter;
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 720px;
  width: 100%;
`;

const Filters = styled.div`
  width: 100%;
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
