import fetch from 'src/utils/fetch';

export async function getInitialProps(props = {}) {
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

  const url = `${process.env.PROTOCOL}://${process.env.HOSTNAME}/api/rollSeed?${queryString}`;
  const rollSeedResponse = await fetch(url);
  const rollSeedJson = await rollSeedResponse.json();

  return rollSeedJson.data;
}
