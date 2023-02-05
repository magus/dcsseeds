import styled from 'styled-components';

const SpacerSize = (props) => `var(--spacer-${props.size || 1})`;

export const Square = styled.div`
  width: ${SpacerSize};
  height: ${SpacerSize};
`;

export const Horizontal = styled.div`
  width: ${SpacerSize};
`;

export const Vertical = styled.div`
  height: ${SpacerSize};
`;
