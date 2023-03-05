import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion } from 'framer-motion';

import * as Unrands from 'src/utils/Unrands';
import * as Spacer from 'src/components/Spacer';
import * as Scroller from 'src/modules/Scroller';

import { ArtifactSearchResult } from './ArtifactSearchResult';
import { useArtifactFilter } from '../hooks/useArtifactFilter';
import * as QueryParams from '../hooks/QueryParams';

export function ArtifactSearch(props) {
  const artifact_filter = useArtifactFilter(props);

  function handle_query(query) {
    const filter_list = query.a;
    const version_list = query.v;
    artifact_filter.sync({ filter_list, version_list });
  }

  return (
    <Container>
      <QueryParams.Sync
        action="push"
        onChange={handle_query}
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
  return props.result_list.map((result) => {
    const key = [result.seed, result.version].join('-');
    return (
      <motion.div
        // force line break
        key={key}
        layout="position"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={spring_config}
      >
        <ArtifactSearchResult {...result} />
      </motion.div>
    );
  });
}

function FilterButton(props) {
  async function handle_click() {
    // console.debug({ name, i });
    if (props.disabled) return;

    await Scroller.top();

    if (props.active) {
      props.handleRemove();
    } else {
      props.handleAdd();
    }
  }

  if (props.hide) {
    return null;
  }

  return (
    <ButtonGroup
      key={props.name}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={spring_config}
      active={props.active}
    >
      <Button image={props.image} active={props.active} disabled={props.disabled} onClick={handle_click}>
        {!props.image ? null : (
          <React.Fragment>
            <Image alt={props.name} src={props.image} width={24} height={24} />
            <Spacer.Horizontal size="1" />
          </React.Fragment>
        )}
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

  for (const unrand_key of filter_unrand_key_list) {
    const name = Unrands.List[unrand_key];
    const active = props.filter_set.has(unrand_key);
    const count = props.artifact_count[unrand_key];
    const metadata = Unrands.Metadata[unrand_key];

    const button = (
      <FilterButton
        key={unrand_key}
        name={name}
        image={metadata.image_url}
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
          <ButtonGroup
            key="clear"
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring_config}
          >
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

  z-index: ${(props) => (props.active ? 1 : 'initial')};
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  font-size: var(--font-small);
  white-space: nowrap;
  padding: ${(props) => {
    if (props.image) {
      return css`0 var(--spacer-d2)`;
    }
    return css`var(--spacer-d2) var(--spacer-d2)`;
  }};

  height: auto;

  opacity: ${(props) => (props.disabled ? 0.4 : 1.0)};

  ${(props) => {
    switch (true) {
      case props.active:
        return css`
          --button-text: rgb(220, 252, 231);
          --button-bg: rgb(21, 128, 61);
          --button-border: rgb(21, 128, 61);
          --button-hover-border: rgb(34 197 94);
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

const spring_config = {
  type: 'spring',
  mass: 0.25,
  stiffness: 150,
};
