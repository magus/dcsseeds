import styled from 'styled-components';
import Link from 'next/link';

export default function StyledLink(props) {
  const { children, className, ...restProps } = props;
  const buttonProps = { className };

  return (
    <Link {...restProps} passHref>
      <a>
        <StyledButton {...buttonProps}>{children}</StyledButton>
      </a>
    </Link>
  );
}

const StyledButton = styled.button`
  margin: 16px 0;
`;
