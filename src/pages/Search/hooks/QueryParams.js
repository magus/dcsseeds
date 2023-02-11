import * as React from 'react';
import { useRouter } from 'next/router';
import { replace } from 'lodash';

export function Init(props) {
  const { onReady, ...param_type_map } = props;
  const router = useRouter();
  const url = router.asPath;

  React.useEffect(() => {
    if (!router.isReady) return;

    // console.debug('[QueryParams.Init]', { url, param_type_map });

    const query = {};

    for (const param_name of Object.keys(param_type_map)) {
      const type = param_type_map[param_name];
      const query_value = router.query[param_name];
      const args = { param_name, type, query_value };
      const param_value = handle_param_type(args);
      if (param_value) {
        // console.debug('[QueryParams.Init]', 'INIT', { ...args, param_value });
        query[param_name] = param_value;
      } else {
        // console.debug('[QueryParams.Init]', 'SKIP', { ...args, param_value });
      }
    }

    // console.debug('[QueryParams.Init]', 'onReady', { query });
    onReady(query);

    function handle_param_type(args) {
      switch (args.type) {
        case 'array': {
          if (Array.isArray(args.query_value)) {
            return args.query_value;
          } else if (typeof args.query_value === 'string') {
            return [args.query_value];
          }
        }

        case 'string':
        default:
          return args.query_value;
      }
    }

    // intentionally run once after router is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, url]);

  return null;
}

export function Sync(props) {
  const router = useRouter();
  let { action, ...param_props } = props;

  const router_action = router[action] || router.replace;

  const values_list = Object.values(param_props);

  // query params can be array values, e.g. a=1&a=2...
  // so we flatten nested array values for useEffect deps
  // also String all values since they must be valid strings
  const deps_array_key = values_list.flat(1).map(String).join('');

  React.useEffect(() => {
    if (!router.isReady) return;

    const url = {};
    url.pathname = router.pathname;

    // ensure we do not clear other query params
    url.query = { ...router.query };

    for (const param_key of Object.keys(param_props)) {
      const param_value = param_props[param_key];
      if (param_value) {
        url.query[param_key] = param_value;
      } else {
        delete url.query[param_key];
      }
    }

    // console.debug('[QueryParams.Sync]', { deps_array_key, param_props, url, action, router_action });

    // // Shallow routing allows you to change the URL without running data fetching methods again,
    // // that includes getServerSideProps, getStaticProps, and getInitialProps.
    // // https://nextjs.org/docs/routing/shallow-routing
    router_action(url, undefined, { shallow: true });

    // intentionally run only when filter set changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps_array_key]);

  return null;
}
