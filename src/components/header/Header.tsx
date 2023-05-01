import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

const Header = () => {
  return (
    <>
      <HeaderSection>
        <DetailSection>
          <Logo />
          <LoginSingUpLinkSection>
            <LoginSignUpLink to={'/user/login'}>로그인</LoginSignUpLink>
            <LoginSignUpLink to={'/user/signUp'}>회원가입</LoginSignUpLink>
          </LoginSingUpLinkSection>
        </DetailSection>
      </HeaderSection>
    </>
  );
};

const HeaderSection = styled.header`
  border-bottom: 1px solid var(--gray-color-2);
`;

const DetailSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin: var(--common-margin);
  max-width: var(--common-width);
  padding: 1rem 0;
`;

const LoginSingUpLinkSection = styled.div`
  display: flex;
  align-items: center;
  width: 8rem;
  height: 3rem;
`;

const LoginSignUpLink = styled(Link)`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.2rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--black-color-2);

  &:not(:last-child) {
    border-right: 1px solid var(--gray-color-1);
  }
`;

export default Header;
