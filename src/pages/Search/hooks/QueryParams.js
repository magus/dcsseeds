import * as React from 'react';
import { useRouter } from 'next/router';
import { replace } from 'lodash';

export function Sync(props) {
  const router = useRouter();

  if (!router.isReady) return null;

  return <SyncInternal {...props} router={router} />;
}

function SyncInternal(props) {
  const { action, onChange, params, router } = props;
  const router_url = router.asPath;

  // track first run to ensure we do not run sync too early
  const is_init = React.useRef(false);

  // reset is_syncing flag to ensure it's always correct
  const is_syncing = React.useRef(false);
  is_syncing.current = false;

  // target_query represents query from params passed in props
  // router_query represents query from router state
  const target_query = {};
  const router_query = {};

  for (const name of Object.keys(params)) {
    const [type, value] = params[name];
    const query_value = normalize_query_value({ name, type, router });

    update_query(target_query, name, value);
    update_query(router_query, name, query_value);

    // console.debug({ type, name, value, query_value });
  }

  // query params can be array values, e.g. a=1&a=2...
  // so we flatten nested array values for useEffect deps
  // also String all values since they must be valid strings
  const target_query_key = query_key(target_query);
  const router_query_key = query_key(router_query);

  // console.debug({ ...props, router_url, router_query, router_query_key, target_query, target_query_key });

  React.useEffect(() => {
    if (!is_init.current) return;

    const needs_sync = target_query_key !== router_query_key;

    if (!needs_sync) return;

    is_syncing.current = true;

    const next_url = {};
    next_url.pathname = router.pathname;

    // ensure we do not clear other query params
    next_url.query = { ...router.query };

    for (const name of Object.keys(params)) {
      const value = target_query[name];
      update_query(next_url.query, name, value);
    }

    // console.debug('[QueryParams.Sync]', 'sync', { next_url });

    // Shallow routing allows you to change the URL without running data fetching methods again,
    // that includes getServerSideProps, getStaticProps, and getInitialProps.
    // https://nextjs.org/docs/routing/shallow-routing
    const router_action = router[action] || router.replace;
    router_action(next_url, undefined, { shallow: true });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target_query_key]);

  // this MUST go second to ensure we do not run sync immediately after init
  React.useEffect(() => {
    is_init.current = true;

    let query;

    if (is_syncing.current) {
      query = target_query;
    } else {
      query = router_query;
    }

    // console.debug('[QueryParams.Sync]', 'onChange', { is_syncing: is_syncing.current, query });
    onChange(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router_query_key]);

  return null;
}

function normalize_query_value(args) {
  const query_value = args.router.query[args.name];

  switch (args.type) {
    case 'array': {
      if (Array.isArray(query_value)) {
        return query_value;
      } else if (typeof query_value === 'string') {
        return [query_value];
      }
    }

    case 'string':
    default:
      return query_value;
  }
}

function update_query(query, name, value) {
  if (value) {
    query[name] = value;
  } else {
    delete query[name];
  }
}

function query_key(query) {
  return Object.entries(query)
    .map((entry) => entry.flat(1))
    .flat(1)
    .map(String)
    .join('');
}
