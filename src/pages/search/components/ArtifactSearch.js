import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import useSWR from 'swr';

import { Drawer } from '~/components/ui/Drawer';
import { Dialog } from '~/components/ui/Dialog';
import { useDimensions } from '~/hooks/useDimensions';

import * as Unrands from 'src/utils/Unrands';
import * as Spacer from 'src/components/Spacer';
import * as Scroller from 'src/modules/Scroller';
import { Loading } from 'src/components/Loading';
import { IconMessage } from 'src/components/IconMessage';

import { ArtifactSearchResult } from './ArtifactSearchResult';
import { useArtifactFilter } from '../hooks/useArtifactFilter';
import * as QueryParams from '../hooks/QueryParams';

export function ArtifactSearch(props) {
  const { data, error } = useSWR('/api/cache_unrand_list', fetcher);

  if (error) {
    function handle_reload(event) {
      event.preventDefault();
      location.reload(true);
    }

    return (
      <IconMessage
        icon="🙊"
        message={
          <div>
            Something went wrong getting the artifact list. Try{' '}
            <a href="#" onClick={handle_reload}>
              refreshing the page
            </a>
            , if that does not work please{' '}
            <a href="https://github.com/magus/dcsseeds/issues" target="_blank">
              file an issue
            </a>
            !
          </div>
        }
      />
    );
  }

  let artifact_list = null;

  if (Array.isArray(data?.artifact_list)) {
    artifact_list = data.artifact_list;
  }

  // console.debug({ cache_unrand_query: { data, isLoading, error }, artifact_list });

  if (artifact_list) {
    return <InternalArtifactSearch {...props} artifact_list={artifact_list} />;
  }

  return <Loading />;
}

function InternalArtifactSearch(props) {
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

      {artifact_filter.filter_set.size === 0 ? null : (
        <ClearButton
          key="clear"
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={spring_config}
        >
          <Button onClick={artifact_filter.reset}>{'❌ Clear filters'}</Button>
        </ClearButton>
      )}

      <Spacer.Vertical size="1" />

      <ArtifactFilters {...artifact_filter} />

      <Spacer.Vertical size="2" />

      <ResultsContainer>
        <ArtifactResults {...artifact_filter} />
      </ResultsContainer>
    </Container>
  );
}

function ArtifactResults(props) {
  const [display_count, set_display_count] = React.useState(10);

  const display_result_list = props.result_list.slice(0, display_count);
  const show_more_count = props.result_list.length - display_count;

  function handle_click() {
    set_display_count((c) => c + 10);
  }

  return (
    <React.Fragment>
      {display_result_list.map((result) => {
        const key = [result.seed, result.version].join('-');

        return (
          <motion.div
            // force line break
            key={key}
            // layout="position"
            layout
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1 }}
            // exit={{ opacity: 0 }}
            transition={spring_config}
          >
            <ArtifactSearchResult {...result} />
          </motion.div>
        );
      })}

      {show_more_count <= 0 ? null : <button onClick={handle_click}>Show more ({show_more_count})</button>}
    </React.Fragment>
  );
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
      className={props.className}
      // layout
      // initial={{ opacity: 0 }}
      // animate={{ opacity: 1 }}
      // exit={{ opacity: 0 }}
      transition={spring_config}
      active={props.active}
    >
      <Button
        image={props.image}
        new={props.new}
        active={props.active}
        disabled={props.disabled}
        onClick={handle_click}
      >
        {!props.image ? null : (
          <React.Fragment>
            <img alt={props.name} src={props.image} width={24} height={24} />
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

  const [drawer_open, set_drawer_open] = React.useState(false);

  const search = router.query.q;

  const active_key_list = Array.from(props.filter_set);

  const inactive_key_list = [];
  for (let i = 0; i < Unrands.List.length; i++) {
    if (!props.filter_set.has(i)) {
      inactive_key_list.push(i);
    }
  }

  // when there is only one result, hide the other filter buttons, show the single result
  let filter_unrand_key_list;
  if (props.result_list.length === 1) {
    filter_unrand_key_list = active_key_list;
  } else {
    filter_unrand_key_list = active_key_list.concat(inactive_key_list);
  }

  const is_filtering = props.version_set.size || props.filter_set.size;

  let active_button_list = [];
  let filter_button_list = [];

  for (const unrand_key of filter_unrand_key_list) {
    const metadata = Unrands.Metadata[unrand_key];
    const name = metadata.name;
    const active = props.filter_set.has(unrand_key);
    const count = props.artifact_count[unrand_key];

    // const hide = is_filtering && !active;
    const hide = is_filtering && count === 0;
    const disabled = props.loading || count === 0;
    const is_new = NEW_UNRAND_SET.has(metadata.id);

    const button = (
      <FilterButton
        key={unrand_key}
        name={name}
        new={is_new}
        image={metadata.image_url}
        count={count}
        handleAdd={() => {
          set_drawer_open(false);
          props.add_filter(unrand_key);
        }}
        handleRemove={() => {
          set_drawer_open(false);
          props.remove_filter(unrand_key);
        }}
        disabled={disabled}
        active={active}
        hide={hide}
      />
    );

    if (active) {
      active_button_list.push(button);
    } else {
      // skip filters that do not match active search
      if (search && !name.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }

      filter_button_list.push(button);
    }
  }

  const has_buttons = filter_button_list.length || active_button_list.length;
  const has_active = active_button_list.length;
  const visible_buttons = has_active ? active_button_list : filter_button_list;

  const is_wide = useDimensions((dimensions) => {
    return dimensions.width > 640;
  });

  const modal_description = (
    <span>
      Include another artifact in your search, results will contain <b>all</b> artefacts you selected.
    </span>
  );

  const modal_title = <span>Add artefact</span>;

  const modal_trigger = !has_active ? null : (
    <ButtonGroup>
      <Button className="">+&nbsp;{modal_title}</Button>
    </ButtonGroup>
  );

  let artefact_modal = null;

  if (!filter_button_list.length) {
    artefact_modal = null;
  } else if (is_wide) {
    artefact_modal = (
      <Dialog.Root open={drawer_open} onOpenChange={set_drawer_open}>
        <Dialog.Trigger asChild>{modal_trigger}</Dialog.Trigger>

        <Dialog.Content className="max-h-[80vh] max-w-[80vw] overflow-hidden flex flex-col p-0">
          <div className="ps-4 pe-3 pt-6">
            <Dialog.Title>{modal_title}</Dialog.Title>
            <Dialog.Description className="pe-16">{modal_description}</Dialog.Description>
          </div>

          <div className="overflow-scroll ps-4 pe-3 pb-2">
            <Filters className="">{filter_button_list}</Filters>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    );
  } else {
    artefact_modal = (
      <Drawer.Root open={drawer_open} onOpenChange={set_drawer_open}>
        <Drawer.Trigger asChild>{modal_trigger}</Drawer.Trigger>

        <Drawer.Content className="max-h-[80vh]">
          <div className="ps-2 pe-1 pb-1">
            <Drawer.Title>{modal_title}</Drawer.Title>
            <Drawer.Description>{modal_description}</Drawer.Description>
          </div>

          <div className="min-h-2" />

          <div className="overflow-scroll ps-2 pe-1 pb-1">
            <Filters className="">{filter_button_list}</Filters>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    );
  }

  return (
    <React.Fragment>
      {!has_buttons ? null : <VersionFilters {...props} />}

      <Spacer.Vertical size="3" />

      <Filters>
        {visible_buttons}

        {artefact_modal}
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
            className="min-w-32"
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
  gap: var(--spacer-d2);
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  flex-grow: 1;

  z-index: ${(props) => (props.active ? 1 : 'initial')};
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  font-size: var(--font-small);
  white-space: nowrap;
  padding: var(--spacer-d2);

  height: auto;

  opacity: ${(props) => (props.disabled ? 0.4 : 1.0)};

  ${(props) => {
    switch (true) {
      case props.active:
        // tailwind green [100, 700, 500]
        return css`
          --button-text: rgb(220, 252, 231);
          --button-bg: rgb(21, 128, 61);
          --button-border: rgb(21, 128, 61);
          --button-hover-border: rgb(34 197 94);
        `;

      case props.new:
        // tailwind amber [100, 700, 500]
        return css`
          --button-text: rgb(254 243 199);
          --button-bg: rgb(180 83 9);
          --button-border: rgb(180 83 9);
          --button-hover-border: rgb(245 158 11);
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

const ClearButton = styled(ButtonGroup)`
  flex: initial;
  width: 100%;
`;

// https://motion.dev/docs/react-transitions#spring
const spring_config = {
  type: 'spring',
  mass: 0.1,
  damping: 6,
  // duration: 0.1,
  // duration: 0.2,
  //
  // type: 'tween',
  // duration: 0.4,
};

const NEW_UNRAND_SET = new Set([
  // force line break for readability
  'UNRAND_AMULET_INVISIBILITY',
  'UNRAND_CHARLATANS_ORB',
  'UNRAND_DREAMDUST_NECKLACE',
  'UNRAND_BRILLIANCE',
  'UNRAND_GADGETEER',
  'UNRAND_MULE',
  'UNRAND_SCARF_INVISIBILITY',
  'UNRAND_DOOM_KNIGHT',
  // 0.33
  'UNRAND_VAINGLORY',
  'UNRAND_FISTICLOAK',
  'UNRAND_JUSTICARS_REGALIA',
  'UNRAND_SKULL_OF_ZONGULDROK',
]);

const fetcher = (url) => fetch(url).then((res) => res.json());
