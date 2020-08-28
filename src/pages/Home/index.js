import dynamic from 'next/dynamic';
import Home from './Home';
import Page from 'src/components/Page';

const HomePage = Page(Home, { withApollo: true });

// disable ssr for consistent page load
// alternative would be to use query only after setting a state field in onMount effect
// See History
export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false,
});
