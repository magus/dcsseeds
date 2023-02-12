export { default } from 'src/pages/ItemsSeedVersion';
export { getStaticProps } from 'src/pages/ItemsSeedVersion/getStaticProps';

// do not generate pages just let dynamic urls fetch static props
// https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#generating-paths-on-demand
export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}
