import Page from 'src/components/Page';
import New from './New';
import getInitialProps from './getInitialProps';

const NewPage = Page(New, { withApollo: true });

NewPage.getInitialProps = async () => await getInitialProps();

export default NewPage;
