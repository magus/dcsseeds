import Species from 'src/utils/Species';
import Backgrounds from 'src/utils/Backgrounds';
import Versions from 'src/utils/Versions';
import fetch from 'src/utils/fetch';

export default async function getInitialProps(props = {}) {
  const { version, species, background } = props;
  const query = { version, species, background };
  const queryString = Object.keys(query)
    .map((key) => {
      const value = query[key];
      if (!value) return null;
      return `${key}=${value}`;
    })
    .filter((_) => !!_)
    .join('&');

  const resp = await fetch(`${process.env.PROTOCOL}://${process.env.HOSTNAME}/api/rollSeed?${queryString}`);
  const json = await resp.json();

  return json.data;
}
