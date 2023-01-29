import * as React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { AnimateSharedLayout, motion } from 'framer-motion';

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
    const versionSpecies = Versions.getSpecies({ version }).map((_) => _.value);
    // if species not available in version, reset to first species
    if (!~versionSpecies.indexOf(species)) set_species(versionSpecies[0]);

    const versionBackgrounds = Versions.getBackgrounds({ version }).map((_) => _.value);
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

  function handleInputChange(event) {
    set_value(event.target.value);
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
    const species = sp.value;
    const speciesVersion = Versions.Recommended.Species[version];
    if (!speciesVersion) throw new Error(`Versions.Recommended.Species missing version [${version}]`);
    const speciesVersionBackground = speciesVersion[background];
    if (!speciesVersionBackground)
      throw new Error(`Versions.Recommended.Species missing version [${version}] for background [${background}]`);

    const backgroundVersion = Versions.Recommended.Backgrounds[version];
    if (!backgroundVersion) throw new Error(`Versions.Recommended.Backgrounds missing version [${version}]`);
    const backgroundVersionSpecies = backgroundVersion[species];
    if (!backgroundVersionSpecies)
      throw new Error(`Versions.Recommended.Backgrounds missing version [${version}] for species [${species}]`);

    const recommendedSpecies = !!speciesVersionBackground[species];
    const recommendedBackground = !!backgroundVersionSpecies[background];

    let tier;
    if (recommendedSpecies && recommendedBackground) {
      tier = 0;
    } else if (recommendedSpecies || recommendedBackground) {
      tier = 1;
    } else {
      tier = 2;
    }

    return {
      value: sp.value,
      name: Species.Names[sp.value],
      tier,
      disabled: sp.banned,
    };
  });

  const backgroundsOptions = Versions.getBackgrounds({ version, species }).map((bg) => {
    const background = bg.value;
    const speciesVersion = Versions.Recommended.Species[version];
    if (!speciesVersion) throw new Error(`Versions.Recommended.Species missing version [${version}]`);
    const speciesVersionBackground = speciesVersion[background];
    if (!speciesVersionBackground)
      throw new Error(`Versions.Recommended.Species missing version [${version}] for background [${background}]`);

    const backgroundVersion = Versions.Recommended.Backgrounds[version];
    if (!backgroundVersion) throw new Error(`Versions.Recommended.Backgrounds missing version [${version}]`);
    const backgroundVersionSpecies = backgroundVersion[species];
    if (!backgroundVersionSpecies)
      throw new Error(`Versions.Recommended.Backgrounds missing version [${version}] for species [${species}]`);

    const recommendedSpecies = !!speciesVersionBackground[species];
    const recommendedBackground = !!backgroundVersionSpecies[background];

    // console.debug({ species, background, recommendedBackground, recommendedSpecies });

    let tier;
    if (recommendedSpecies && recommendedBackground) {
      tier = 0;
    } else if (recommendedBackground || recommendedSpecies) {
      tier = 1;
    } else {
      tier = 2;
    }

    return {
      value: bg.value,
      name: Backgrounds.Names[bg.value],
      tier,
      disabled: bg.banned,
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
          animated
          onChange={set_species}
          options={speciesOptions}
          selected={species}
          onLock={handleLockChange('species')}
          locked={!!locks.species}
        />

        <Select
          title="Background"
          animated
          onChange={set_background}
          options={backgroundsOptions}
          selected={background}
          onLock={handleLockChange('background')}
          locked={!!locks.background}
        />

        <Select title="Version" onChange={handleVersion} options={VERSION_CHOICES} selected={version} />

        <GroupTitle>Seed</GroupTitle>

        <input value={value} onChange={handleInputChange} />

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

function Select({ title, animated, locked, onLock, selected, onChange, options }) {
  return (
    <AnimateSharedLayout>
      <SelectContainer>
        <GroupTitle>
          {title} {onLock && <Lock onChange={onLock} locked={locked} />}
        </GroupTitle>

        <SelectOptions>
          {options.map(({ value, name, tier, disabled }) => {
            const isSelected = selected === value;

            if (locked && !isSelected) return null;

            function handleClick() {
              onChange(value);
            }

            return (
              <SelectOption key={value} {...{ isSelected, disabled, tier }} onClick={handleClick}>
                {name || value}
                {isSelected && <SelectedBox layoutId={animated ? 'selected' : undefined} />}
              </SelectOption>
            );
          })}
        </SelectOptions>
      </SelectContainer>
    </AnimateSharedLayout>
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

const SelectedBox = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 4px solid var(--text-color);
  border-radius: 0.25rem;
`;
const SelectOption = styled.button`
  position: relative;
  margin: 0 8px 8px 0;
  border: 1px solid transparent;

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

  ${({ disabled }) =>
    disabled &&
    `
    color: #F87171;
  `}

  ${({ isSelected }) =>
    !isSelected
      ? `
    background: transparent;
    opacity: 0.4;
  `
      : `
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
  // <Select> options
  { value: Versions.v29 },
  { value: Versions.v28 },
  { value: Versions.v27 },
  { value: Versions.v26 },
  { value: Versions.v25 },
  { value: Versions.v24 },
];
