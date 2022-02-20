import fetch from 'src/utils/fetch';
import Species from 'src/utils/Species';
import Backgrounds from 'src/utils/Backgrounds';
import Versions from 'src/utils/Versions';

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

  const rollSeedResponse = await fetch(`${process.env.PROTOCOL}://${process.env.HOSTNAME}/api/rollSeed?${queryString}`);
  const rollSeedJson = await rollSeedResponse.json();

  return rollSeedJson.data;
}
