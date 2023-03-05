import Page from 'src/components/Page';
import New from './New';
import { getInitialProps } from './getInitialProps';

const withApollo = true;
const ThisPage = Page(New, { withApollo });

ThisPage.getInitialProps = getInitialProps;

export default ThisPage;
