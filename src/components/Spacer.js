import styled from 'styled-components';

const SpacerSize = (props) => `var(--spacer-${props.size || 1})`;

export const Square = styled.span`
  display: block;
  min-width: ${SpacerSize};
  min-height: ${SpacerSize};
`;

export const Horizontal = styled.span`
  display: block;
  min-width: ${SpacerSize};
  min-height: 1px;
`;

export const Vertical = styled.span`
  display: block;
  min-width: 1px;
  min-height: ${SpacerSize};
`;
