import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { uid } from '../../store/data';
import Logo from '../Logo';
import { auth } from '../../../firebase';

const Header = () => {
  const [userUID, setUserUID] = useRecoilState(uid);
  const [, , removeCookie] = useCookies(['uid']);
  const [loginState, setLoginState] = useState<boolean>();
  const navigate = useNavigate();

  useEffect(() => {
    userUID === 'anonymous' ? setLoginState(false) : setLoginState(true);
  }, [userUID]);

  const logout = () => {
    const logoutConfirm = confirm('로그아웃을 하시겠습니까?');

    if (logoutConfirm) {
      try {
        auth.signOut();
        setUserUID('anonymous');
        removeCookie('uid');
        navigate('/');
      } catch (err) {
        alert('잠시 후 다시 로그아웃을 해주세요.');
      }
    }
  };

  return (
    <>
      <HeaderSection>
        <DetailSection>
          <Logo />
          <LoginSingUpLinkSection>
            {loginState ? <Logout onClick={() => logout()}>로그아웃</Logout> : <LinkButton to={'/user/login'}>로그인</LinkButton>}
            {loginState ? <LinkButton to={'/user/profile'}>마이페이지</LinkButton> : <LinkButton to={'/user/signUp'}>회원가입</LinkButton>}
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
  width: 8.5rem;
  height: 3rem;
`;

const LinkButton = styled(Link)`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.2rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--black-color-2);
  font-weight: 500;
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
  font-size: 0.75rem;
  color: var(--black-color-1);
  background-color: var(--white-color-1);
  border: none;
  font-weight: 600;
  &:not(:last-child) {
    border-right: 1px solid var(--gray-color-1);
  }
`;
export default Header;
