import Page from 'src/components/Page';
import Search from './Search';

export { getStaticProps } from './getStaticProps';

const withApollo = true;
export default Page(Search, { withApollo });
