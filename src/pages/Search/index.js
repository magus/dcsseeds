import Page from 'src/components/Page';
import Search from './Search';
import getInitialProps from './getInitialProps';

const SearchPage = Page(Search, { withApollo: true });

SearchPage.getInitialProps = async () => await getInitialProps();

export default SearchPage;
