import * as React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import CopyButton from 'src/components/CopyButton';

import Species from 'src/utils/Species';
import Backgrounds from 'src/utils/Backgrounds';

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
  const value = props.seed;
  const [species, set_species] = React.useState(props.species);
  const [background, set_background] = React.useState(props.background);
  const [version, set_version] = React.useState(CurrentVersion);

  const handleSpecies = (e) => {
    set_species(e.target.value);
  };

  const handleBackground = (e) => {
    set_background(e.target.value);
  };

  const handleVersion = (e) => {
    set_version(e.target.value);
  };

  const handleSubmitSeed = async () => {
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

    router.push('/');
  };

  return (
    <Container>
      <FlexColumns>
        <Select onChange={handleSpecies} options={Object.values(Species.Names)} selected={species} />
        <Select onChange={handleBackground} options={Object.values(Backgrounds.Names)} selected={background} />
        <Select onChange={handleVersion} options={Versions} selected={version} />

        <CopyButton>{value}</CopyButton>

        <button onClick={handleSubmitSeed}>Submit Seed</button>

        <ConsoleLink href="/admin" target="_blank">
          <button>Open Console</button>
        </ConsoleLink>
      </FlexColumns>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FlexColumns = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConsoleLink = styled.a`
  margin: 16px 0;
  font-size: 24px;
  font-weight: 400;
`;

const CurrentVersion = '0.25';
const Versions = [
  '0.26',
  '0.25',
  '0.24',
  '0.23',
  '0.22',
  '0.21',
  '0.20',
  '0.19',
  '0.18',
  '0.17',
  '0.16',
  '0.15',
  '0.14',
  '0.13',
  '0.12',
  '0.11',
  '0.10',
];
