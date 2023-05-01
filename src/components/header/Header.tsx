import styled from '@emotion/styled';
import logo from '../../../public/logo.svg';

const Header = () => {
  return (
    <>
      <HeaderSection>
        <DetailSection>
          <Logo>
            <Link />
          </Logo>
          <LoginSingUpLinkSection>
            <LoginSignUpLink>로그인</LoginSignUpLink>
            <LoginSignUpLink>회원가입</LoginSignUpLink>
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

const Logo = styled.h1`
  width: 10rem;
  height: 2.8rem;
  background-color: var(--white-color-1);
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const Link = styled.a`
  font-size: 5rem;
  text-indent: -9999px;
`;

const LoginSingUpLinkSection = styled.div`
  display: flex;
  align-items: center;
  width: 8rem;
  height: 3rem;
`;

const LoginSignUpLink = styled.a`
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
