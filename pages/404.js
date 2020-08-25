import styled from 'styled-components';

export default function NotFound() {
  return (
    <Container>
      <div>
        <H1>404</H1>
        <Message>
          <H2>This page could not be found.</H2>
        </Message>
      </div>
    </Container>
  );
}

const Container = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, Roboto, 'Segoe UI', 'Fira Sans', Avenir, 'Helvetica Neue',
    'Lucida Grande', sans-serif;
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const H1 = styled.h1`
  display: inline-block;
  border-right: 1px solid rgba(var(--font-color-rgb), 0.3);
  margin: 0;
  margin-right: 20px;
  padding: 10px 23px 10px 0;
  font-size: 24px;
  font-weight: 500;
  vertical-align: top;
`;

const Message = styled.div`
  display: inline-block;
  text-align: left;
  line-height: 49px;
  height: 49px;
  vertical-align: middle;
`;

const H2 = styled.h2`
  font-size: 14px;
  font-weight: normal;
  line-height: inherit;
  margin: 0;
  padding: 0;
`;
