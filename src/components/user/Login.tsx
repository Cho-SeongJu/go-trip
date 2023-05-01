import styled from '@emotion/styled';
import Logo from '../Logo';

const Login = () => {
  return (
    <>
      <LoginSection>
        <Logo />
      </LoginSection>
    </>
  );
};

const LoginSection = styled.div`
  width: 50rem;
  margin: var(--common-margin);
  height: 100vh;
  border: 1px solid black;
`;

export default Login;
