import styled from 'styled-components';
import Link from 'next/link';

export default function StyledLink(props) {
  const { children, ...restProps } = props;

  return (
    <Link {...restProps} passHref>
      <StyledButton>{children}</StyledButton>
    </Link>
  );
}

const StyledButton = styled.button`
  margin: 16px 0;
`;
