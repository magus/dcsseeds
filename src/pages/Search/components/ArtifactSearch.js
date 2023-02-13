import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import * as Unrands from 'src/utils/Unrands';
import * as Spacer from 'src/components/Spacer';
import { useArtifactFilter } from '../hooks/useArtifactFilter';

import { ArtifactSearchResult } from './ArtifactSearchResult';
import * as QueryParams from '../hooks/QueryParams';

export function ArtifactSearch(props) {
  const artifact_filter = useArtifactFilter(props);

  function init_from_query(query) {
    const filter_list = query.a;
    const version_list = query.v;
    artifact_filter.sync({ filter_list, version_list });
  }

  return (
    <Container>
      <QueryParams.Sync
        action="push"
        onChange={init_from_query}
        params={{
          v: ['array', Array.from(artifact_filter.version_set)],
          a: ['array', Array.from(artifact_filter.filter_set).map((i) => Unrands.List[i])],
        }}
      />

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

function FilterButton(props) {
  function handle_click() {
    // console.debug({ name, i });
    if (props.disabled) return;

    if (props.active) {
      props.handleRemove();
    } else {
      props.handleAdd();
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  if (props.hide) {
    return null;
  }

  return (
    <ButtonGroup
      key={props.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout="position"
    >
      <Button active={props.active} disabled={props.disabled} onClick={handle_click}>
        {props.name} ({props.count})
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
    const count = props.artifact_count[unrand_key];

    const button = (
      <FilterButton
        key={unrand_key}
        name={name}
        count={count}
        handleAdd={() => props.add_filter(unrand_key)}
        handleRemove={() => props.remove_filter(unrand_key)}
        disabled={props.loading || count === 0}
        active={active}
        hide={count === 0}
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
    <React.Fragment>
      {!button_list.length ? null : <VersionFilters {...props} />}

      <Filters>
        {props.filter_set.size === 0 ? null : (
          <ButtonGroup>
            <Button onClick={props.reset}>❌ Clear</Button>
          </ButtonGroup>
        )}

        {button_list}
      </Filters>
    </React.Fragment>
  );
}

function VersionFilters(props) {
  const version_list = Array.from(props.version_count.keys()).sort();

  return (
    <Filters>
      {version_list.map((version) => {
        const active = props.version_set.has(version);
        const count = props.version_count.get(version);

        return (
          <FilterButton
            key={version}
            name={version}
            count={count}
            handleAdd={() => props.add_version(version)}
            handleRemove={() => props.remove_version(version)}
            disabled={props.loading || (!active && count === 0)}
            active={active}
          />
        );
      })}
    </Filters>
  );
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  min-width: 320px;
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
      case props.disabled:
        return css`
          opacity: 0.4;
        `;
      default:
        return '';
    }
  }}
`;
