import fetch from 'src/utils/fetch';

export default async function getInitialProps() {
  const resp = await fetch(`${process.env.PROTOCOL}://${process.env.HOSTNAME}/api/rollSeed`);
  const json = await resp.json();

  return json.data;
}
