import * as React from 'react';
import { useRouter } from 'next/router';

export function Init(props) {
  const router = useRouter();

  React.useEffect(() => {
    if (!router.isReady) return;

    // console.debug('[QueryParams.Init]', { props });

    for (const param_name of Object.keys(props)) {
      const param_config = props[param_name];
      const query_value = router.query[param_name];

      let type;
      let handle_param;

      if (typeof param_config === 'function') {
        type = 'string';
        handle_param = param_config;
      } else if (Array.isArray(param_config)) {
        [type, handle_param] = param_config;
      }

      const args = { param_name, type, query_value, handle_param };
      const param_value = handle_param_type(args);
      if (param_value) {
        console.debug('[QueryParams.Init]', 'INIT', args);
        args.handle_param(param_value);
      } else {
        console.debug('[QueryParams.Init]', 'SKIP', args);
      }
    }

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

    // let param_final = router.query.a;

    // // ensure single value is also always an array for consistency
    // if (param_final) {
    //   if (!Array.isArray(param_final)) {
    //     param_final = [param_final];
    //   }
    // }

    // intentionally run once after router is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return null;
}

export function Sync(props) {
  const router = useRouter();
  const values_list = Object.values(props);

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

    for (const param_key of Object.keys(props)) {
      const param_value = props[param_key];
      if (param_value) {
        url.query[param_key] = param_value;
      } else {
        delete url.query[param_key];
      }
    }

    console.debug('[QueryParams.Sync]', { deps_array_key, props, url });

    // // Shallow routing allows you to change the URL without running data fetching methods again,
    // // that includes getServerSideProps, getStaticProps, and getInitialProps.
    // // https://nextjs.org/docs/routing/shallow-routing
    router.replace(url, undefined, { shallow: true });

    // intentionally run only when filter set changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps_array_key]);

  return null;
}
