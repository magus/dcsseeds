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

  function handleVersion(version) {
    const versionSpecies = Versions.getSpecies({ version });
    // if species not available in version, reset to first species
    if (!~versionSpecies.indexOf(species)) set_species(versionSpecies[0]);

    const versionBackgrounds = Versions.getBackgrounds({ version });
    // if background not available in version, reset to first background
    if (!~versionBackgrounds.indexOf(background)) set_background(versionBackgrounds[0]);

    // finally set version
    set_version(version);
  }

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

    let tier;
    if (recommendedSpecies && recommendedBackground) {
      tier = 0;
    } else if (recommendedSpecies) {
      tier = 1;
    } else {
      tier = 2;
    }

    return {
      value: sp,
      name: Species.Names[sp],
      tier,
    };
  });

  const backgroundsOptions = Versions.getBackgrounds({ version, species }).map((bg) => {
    const recommendedSpecies = !!Versions.Recommended.Species[version][bg][species];
    const recommendedBackground = !!Versions.Recommended.Backgrounds[version][species][bg];

    let tier;
    if (recommendedSpecies && recommendedBackground) {
      tier = 0;
    } else if (recommendedBackground) {
      tier = 1;
    } else {
      tier = 2;
    }

    return {
      value: bg,
      name: Backgrounds.Names[bg],
      tier,
    };
  });

  return (
    <Container>
      <FlexColumns>
        <StyledLink href="/">Back to Home</StyledLink>
        <button onClick={handleReroll}> Reroll</button>
        <Instructions>Here, have this random seed.</Instructions>

        <Select
          title="Species"
          onChange={set_species}
          options={speciesOptions}
          selected={species}
          onLock={handleLockChange('species')}
          locked={!!locks.species}
        />

        <Select
          title="Background"
          onChange={set_background}
          options={backgroundsOptions}
          selected={background}
          onLock={handleLockChange('background')}
          locked={!!locks.background}
        />

        <Select title="Version" onChange={handleVersion} options={VERSION_CHOICES} selected={version} />

        <GroupTitle>Seed</GroupTitle>
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

function Select({ title, locked, onLock, selected, onChange, options }) {
  return (
    <SelectContainer>
      <GroupTitle>
        {title} {onLock && <Lock onChange={onLock} locked={locked} />}
      </GroupTitle>

      <SelectOptions>
        {options.map(({ value, name, tier }) => {
          const isSelected = selected === value;

          if (locked && !isSelected) return null;

          function handleClick() {
            onChange(value);
          }

          return (
            <SelectOption key={value} {...{ isSelected, tier }} onClick={handleClick}>
              {name || value}
            </SelectOption>
          );
        })}
      </SelectOptions>
    </SelectContainer>
  );
}

const SelectContainer = styled.div`
  margin: 16px 0;
  display: flex;
  flex-direction: column;
`;

const GroupTitle = styled.div`
  margin: 8px 0 4px 0;
  font-weight: 400;
  font-size: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SelectOptions = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const SelectOption = styled.button`
  margin: 0 8px 8px 0;
  border: 1px solid transparent;
  background: transparent;

  ${({ tier }) =>
    tier === 0 &&
    `
    color: #059669;
    border: 1px solid rgba(var(--gray-color-rgb), 0.4);
  `}

  ${({ tier }) =>
    tier === 1 &&
    `
    color: #A7F3D0;
    border: 1px solid rgba(var(--gray-color-rgb), 0.4);
  `}

  ${({ tier, isSelected }) =>
    tier === 2 &&
    !isSelected &&
    `
    color: rgba(var(--gray-color-rgb), 0.4);
  `}

  ${({ isSelected }) =>
    !isSelected
      ? `
    opacity: 0.4;
  `
      : `
    border: 1px solid var(--font-color);
  `}
`;

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
`;

const FlexColumns = styled.div`
  display: flex;
  flex-direction: column;
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
  // <Select> options
  { value: Versions.v26 },
  { value: Versions.v25 },
  { value: Versions.v24 },
];
