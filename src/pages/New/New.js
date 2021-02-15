import * as React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import CopyButton from 'src/components/CopyButton';
import Loading from 'src/components/Loading';
import StyledLink from 'src/components/StyledLink';

import Species from 'src/utils/Species';
import Backgrounds from 'src/utils/Backgrounds';
import Versions from 'src/utils/Versions';
import * as GraphqlSeed from 'src/graphql/seed';

import getInitialProps from './getInitialProps';

function Select({ selected, onChange, options }) {
  return (
    <select onChange={onChange} value={selected}>
      {options.map((species) => {
        const isSelected = selected === species;

        return (
          <option key={species} value={species}>
            {species}
          </option>
        );
      })}
    </select>
  );
}

export default function New(props) {
  const router = useRouter();
  const [saving, set_saving] = React.useState(false);
  const [species, set_species] = React.useState(props.species);
  const [background, set_background] = React.useState(props.background);
  const [value, set_value] = React.useState(props.seed);
  const [version, set_version] = React.useState(DEFAULT_VERSION);

  const activeSeedsQuery = useQuery(GraphqlSeed.ACTIVE_SEEDS.query, {
    // use cache but always refetch on mount
    fetchPolicy: 'cache-and-network',
  });

  const handleSpecies = (e) => {
    set_species(e.target.value);
  };

  const handleBackground = (e) => {
    set_background(e.target.value);
  };

  const handleVersion = (e) => {
    set_version(e.target.value);
  };

  const handleReroll = async () => {
    const newProps = await getInitialProps();
    set_value(newProps.seed);
    set_background(newProps.background);
    set_species(newProps.species);
  };

  const handleSubmitSeed = async () => {
    set_saving(true);

    // http://localhost:3000/api/newSeed?background=Ice%20Elementalist&species=Ogre&version=0.25&value=06394256146285325279
    const query = { background, species, version, value };
    const queryString = Object.keys(query)
      .reduce((q, key) => {
        q.push([key, query[key]].join('='));
        return q;
      }, [])
      .join('&');

    const url = `/api/newSeed?${queryString}`;
    const resp = await fetch(url);
    const respJson = await resp.json();

    set_saving(false);
    activeSeedsQuery.refetch();
    router.push('/');
  };

  if (activeSeedsQuery.loading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  const tooManyActiveSeeds = GraphqlSeed.ACTIVE_SEEDS.parse(activeSeedsQuery);

  if (tooManyActiveSeeds) {
    return (
      <Container>
        <FlexColumns>
          <Instructions>There are too many active seeds, try completing some active seeds!</Instructions>
          <StyledLink href="/">Back to Home</StyledLink>
        </FlexColumns>
      </Container>
    );
  }

  const speciesOptions = Versions.Species[version].map((s) => Species.Names[s]);
  const backgroundsOptions = Versions.Backgrounds[version].map((s) => Backgrounds.Names[s]);

  return (
    <Container>
      <FlexColumns>
        <Instructions>
          <StyledLink href="/">Back to Home</StyledLink>
          <button onClick={handleReroll}> Reroll</button>
          Here, have this random seed.
        </Instructions>

        <Select onChange={handleSpecies} options={speciesOptions} selected={species} />
        <Select onChange={handleBackground} options={backgroundsOptions} selected={background} />
        <Select onChange={handleVersion} options={VERSION_CHOICES} selected={version} />
        <input disabled value={value} />

        <Instructions>
          Clicking <b>Save Seed</b> below will publish this seed to the Home page.
        </Instructions>

        <button disabled={saving} onClick={handleSubmitSeed}>
          {saving ? 'Saving...' : 'Save Seed'}
        </button>
      </FlexColumns>
    </Container>
  );
}

const Container = styled.div`
  max-width: 640px;
  min-height: 100%;
  margin: 0 auto;
  padding: 24px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Instructions = styled.div`
  text-align: center;
  margin: 32px 0;
  font-size: 24px;
  display: flex;
  flex-direction: column;
`;

const FlexColumns = styled.div`
  display: flex;
  flex-direction: column;
`;

const DEFAULT_VERSION = Versions.v26;
const VERSION_CHOICES = [Versions.v26, Versions.v25, Versions.v24];
