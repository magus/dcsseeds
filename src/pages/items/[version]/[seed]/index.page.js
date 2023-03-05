import Page from 'src/components/Page';
import { ItemsSeedVersion } from './ItemsSeedVersion';

export { getStaticProps } from './getStaticProps';

// do not generate pages just let dynamic urls fetch static props
// https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#generating-paths-on-demand
export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

const withApollo = true;
export default Page(ItemsSeedVersion, { withApollo });
