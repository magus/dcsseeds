import Page from 'src/components/Page';
import Search from './Search';
import getServerSideProps from './getServerSideProps';

const SearchPage = Page(Search, { withApollo: true });

export default SearchPage;
