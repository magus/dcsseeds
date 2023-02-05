import Page from 'src/components/Page';
import Search from './Search';

const withApollo = true;

const SearchPage = Page(Search, { withApollo });

export default SearchPage;
