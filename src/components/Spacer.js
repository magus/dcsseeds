import styled from 'styled-components';

const SpacerSize = (props) => `var(--spacer-${props.size || 1})`;

export const Square = styled.div`
  display: inline-block;
  min-width: ${SpacerSize};
  min-height: ${SpacerSize};
`;

export const Horizontal = styled.div`
  min-width: ${SpacerSize};
  min-height: 1;
`;

export const Vertical = styled.div`
  display: inline-block;
  min-width: 1;
  min-height: ${SpacerSize};
`;
