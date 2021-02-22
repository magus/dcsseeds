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

export default function New(props) {
  const router = useRouter();
  const [saving, set_saving] = React.useState(false);
  const [species, set_species] = React.useState(props.species);
  const [background, set_background] = React.useState(props.background);
  const [value, set_value] = React.useState(props.seed);
  const [version, set_version] = React.useState(props.version);
  const [locks, set_locks] = React.useState({});

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
    const lockedProps = { version };
    if (locks.species) lockedProps.species = species;
    if (locks.background) lockedProps.background = background;

    // get new props from rollApi endpoint response
    const newProps = await getInitialProps(lockedProps);

    // set new props in local state
    set_value(newProps.seed);
    if (!locks.species) set_species(newProps.species);
    if (!locks.background) set_background(newProps.background);
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

  function handleLockChange(type) {
    return (locked) => {
      set_locks((_) => {
        const newLocks = { ..._ };
        newLocks[type] = locked;
        return newLocks;
      });
    };
  }

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

  const speciesOptions = Versions.getSpecies({ version, background }).map((sp) => {
    const recommendedSpecies = !!Versions.Recommended.Species[version][background][sp];
    const recommendedBackground = !!Versions.Recommended.Backgrounds[version][sp][background];
    return {
      value: sp,
      name: Species.Names[sp],
      recommended: recommendedSpecies,
      flag: recommendedSpecies && recommendedBackground,
    };
  });

  const backgroundsOptions = Versions.getBackgrounds({ version, species }).map((bg) => {
    const recommendedSpecies = !!Versions.Recommended.Species[version][bg][species];
    const recommendedBackground = !!Versions.Recommended.Backgrounds[version][species][bg];
    return {
      value: bg,
      name: Backgrounds.Names[bg],
      recommended: recommendedBackground,
      flag: recommendedSpecies && recommendedBackground,
    };
  });

  return (
    <Container>
      <FlexColumns>
        <Instructions>
          <StyledLink href="/">Back to Home</StyledLink>
          <button onClick={handleReroll}> Reroll</button>
          Here, have this random seed.
        </Instructions>

        <LockSelectionGroup>
          <Lock onChange={handleLockChange('species')} locked={!!locks.species} />
          <Select onChange={handleSpecies} options={speciesOptions} selected={species} />
        </LockSelectionGroup>

        <LockSelectionGroup>
          <Lock onChange={handleLockChange('background')} locked={!!locks.background} />
          <Select onChange={handleBackground} options={backgroundsOptions} selected={background} />
        </LockSelectionGroup>

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

function Lock(props) {
  function handleCheckboxChange(event) {
    const { checked } = event.target;
    props.onChange(checked);
  }

  return (
    <LockContainer title={props.locked ? 'Locked' : 'Unlocked'}>
      <LockContent>
        {props.locked ? '🔒' : '🔓'}
        <LockInput type="checkbox" onChange={handleCheckboxChange} />
      </LockContent>
    </LockContainer>
  );
}

function Select({ selected, onChange, options, lookup }) {
  return (
    <select onChange={onChange} value={selected}>
      {options.map(({ value, name, recommended, flag }) => {
        const isSelected = selected === value;

        return (
          <option key={value} value={value}>
            {flag ? '⭐️' : ''}
            {recommended ? '⭐️' : ''}
            {name || value}
          </option>
        );
      })}
    </select>
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

const LockSelectionGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LockContainer = styled.div`
  padding: 8px;
`;

const LockContent = styled.div`
  position: relative;
  line-height: 24px;
  font-size: 24px;
`;

const LockInput = styled.input`
  cursor: pointer;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  width: 24px;
  height: 24px;
`;

const VERSION_CHOICES = [
  { value: Versions.v26, recommended: true },
  { value: Versions.v25, recommended: false },
  { value: Versions.v24, recommended: false },
];
