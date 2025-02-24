import * as React from 'react';
import styled from 'styled-components';
import { AnimateSharedLayout, motion } from 'framer-motion';

import StyledLink from 'src/components/StyledLink';
import CopyButton from 'src/components/CopyButton';

import Version from 'src/Version';

import { getInitialProps } from './getInitialProps';

export default function New(props) {
  const [species, set_species] = React.useState(props.species);
  const [background, set_background] = React.useState(props.background);
  const [value, set_value] = React.useState(props.seed);
  const [version, set_version] = React.useState(props.version);
  const [locks, set_locks] = React.useState({});

  function handleVersion(version) {
    const versionSpecies = Version.getSpecies({ version }).map((_) => _.value);
    // if species not available in version, reset to first species
    if (!~versionSpecies.indexOf(species)) set_species(versionSpecies[0]);

    const versionBackgrounds = Version.getBackgrounds({ version }).map((_) => _.value);
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

  function handleLockChange(type) {
    return (locked) => {
      set_locks((_) => {
        const newLocks = { ..._ };
        newLocks[type] = locked;
        return newLocks;
      });
    };
  }

  const speciesOptions = Version.getSpecies({ version, background }).map((sp) => {
    const species = sp.value;
    const speciesVersion = Version.Recommended.Species[version];
    if (!speciesVersion) throw new Error(`Version.Recommended.Species missing version [${version}]`);
    const speciesVersionBackground = speciesVersion[background];
    if (!speciesVersionBackground)
      throw new Error(`Version.Recommended.Species missing version [${version}] for background [${background}]`);

    const backgroundVersion = Version.Recommended.Backgrounds[version];
    if (!backgroundVersion) throw new Error(`Version.Recommended.Backgrounds missing version [${version}]`);
    const backgroundVersionSpecies = backgroundVersion[species];
    if (!backgroundVersionSpecies)
      throw new Error(`Version.Recommended.Backgrounds missing version [${version}] for species [${species}]`);

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
      name: sp.name,
      tier,
      disabled: sp.banned,
    };
  });

  const backgroundsOptions = Version.getBackgrounds({ version, species }).map((bg) => {
    const background = bg.value;
    const speciesVersion = Version.Recommended.Species[version];
    if (!speciesVersion) throw new Error(`Version.Recommended.Species missing version [${version}]`);
    const speciesVersionBackground = speciesVersion[background];
    if (!speciesVersionBackground)
      throw new Error(`Version.Recommended.Species missing version [${version}] for background [${background}]`);

    const backgroundVersion = Version.Recommended.Backgrounds[version];
    if (!backgroundVersion) throw new Error(`Version.Recommended.Backgrounds missing version [${version}]`);
    const backgroundVersionSpecies = backgroundVersion[species];
    if (!backgroundVersionSpecies)
      throw new Error(`Version.Recommended.Backgrounds missing version [${version}] for species [${species}]`);

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
      name: bg.name,
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

        <CopyButton tooltip copy={value} title="Click to copy seed" copyMessage="Seed copied!">
          <SeedDisplay>{value}</SeedDisplay>
        </CopyButton>

        <Select title="Version" onChange={handleVersion} options={VERSION_CHOICES} selected={version} />

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

const SeedDisplay = styled.div`
  font-size: 24px;
  width: 100%;
  text-align: center;
`;

// <Select> options
const VERSION_CHOICES = [
  // { value: Version.v30, name: '0.30' },
  // { value: Version.v29, name: '0.29' },
  // { value: Version.v28, name: '0.28' },
  // { value: Version.v27, name: '0.27' },
  // { value: Version.v26, name: '0.26' },
  // { value: Version.v25, name: '0.25' },
  // { value: Version.v24, name: '0.24' },
];

// generate version options from version metadata
for (const version of Object.keys(Version.Enum)) {
  const metadata = Version.get_metadata(version);

  const value = version;
  const name = metadata.Name;

  VERSION_CHOICES.push({ value, name });
}
