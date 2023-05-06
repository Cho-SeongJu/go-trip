import styled from '@emotion/styled';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { userAuth } from '../../store/data';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';

const Header = () => {
  const [userLoginState, setUserAuth] = useRecoilState(userAuth);
  const [loginState, setLoginState] = useState<boolean>();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(userLoginState, 'asd');
    if (userLoginState === 'anonymous') {
      setLoginState(false);
    } else {
      setLoginState(true);
    }
  }, [userLoginState]);

  const logout = async () => {
    setUserAuth('anonymous');
    await signOut(auth);
    navigate('/');
  };

  return (
    <>
      <HeaderSection>
        <DetailSection>
          <Logo />
          <LoginSingUpLinkSection>
            {loginState ? <Logout onClick={() => logout}>로그아웃</Logout> : <LoginSignUpLink to={'/user/login'}>로그인</LoginSignUpLink>}
            {loginState ? <LoginSignUpLink to={'/user/profile'}>마이페이지</LoginSignUpLink> : <LoginSignUpLink to={'/user/signUp'}>회원가입</LoginSignUpLink>}
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

const Logout = styled.button`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.2rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--black-color-2);
  background-color: var(--white-color-1);
  border: none;

  &:not(:last-child) {
    border-right: 1px solid var(--gray-color-1);
  }
`;
export default Header;
