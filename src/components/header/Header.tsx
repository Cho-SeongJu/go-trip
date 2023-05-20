import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { auth } from '../../../firebase';
import { uid, userInfo } from '../../store/data';
import { getExpireTime } from '../../store/date';
import logo from '../../../public/logo.svg';

const Header = () => {
  const [loginState, setLoginState] = useState<boolean>();
  const [userUID, setUserUID] = useRecoilState(uid);
  const [loginUserInfo, setLoginUserInfo] = useRecoilState(userInfo);
  const [, setCookie, removeCookie] = useCookies(['uid']);
  const userId = useRecoilValue(uid);
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
        setLoginUserInfo({ NICKNAME: 'anonymous' });
        navigate('/');
      } catch (err) {
        alert('잠시 후 다시 로그아웃을 해주세요.');
      }
    }
  };

  const setCookieHandle = () => {
    if (userId === 'anonymous') {
      navigate('/user/login');
      return;
    } else {
      const expireTime = getExpireTime();
      setCookie('uid', userId, { path: '/', expires: expireTime });
    }
  };

  return (
    <>
      <HeaderSection>
        <DetailSection>
          <Heading>
            <HomeLink
              onClick={setCookieHandle}
              to="/"
            />
          </Heading>
          <LoginSingUpLinkSection>
            {loginUserInfo['NICKNAME'] !== 'anonymous' && (
              <WelcomePharse>
                <UserNickName>{loginUserInfo?.NICKNAME}</UserNickName>
                님, 환영합니다.
              </WelcomePharse>
            )}
            {loginState ? <Logout onClick={() => logout()}>로그아웃</Logout> : <LinkButton to={'/user/login'}>로그인</LinkButton>}
            {loginState ? (
              <LinkButton
                onClick={setCookieHandle}
                to={'/user/profile/editUserInfo'}
              >
                마이페이지
              </LinkButton>
            ) : (
              <LinkButton to={'/user/signUp'}>회원가입</LinkButton>
            )}
          </LoginSingUpLinkSection>
        </DetailSection>
      </HeaderSection>
    </>
  );
};

const HeaderSection = styled.header`
  position: sticky;
  top: 0;
  background-color: var(--white-color-1);
  border-bottom: 1px solid var(--gray-color-2);
  z-index: 9999;
`;

const DetailSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin: var(--common-margin);
  max-width: var(--common-width);
  padding: 1rem 0;
`;

const Heading = styled.h1`
  width: 8rem;
  height: 2.8rem;
`;

const HomeLink = styled(Link)`
  display: block;
  width: 8rem;
  height: 2.8rem;
  font-size: 2rem;
  text-indent: -9999px;
  cursor: pointer;
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
`;

const LoginSingUpLinkSection = styled.div`
  display: flex;
  align-items: center;
  height: 3rem;
`;

const LinkButton = styled(Link)`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0.7rem;
  height: 1.2rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--black-color-2);
  cursor: pointer;

  &:not(:last-child) {
    border-right: 1px solid var(--gray-color-1);
  }
`;

const WelcomePharse = styled.p`
  font-size: 0.8rem;
  padding-right: 0.4rem;
`;

const UserNickName = styled.span`
  color: var(--blue-sky-color-1);
`;

const Logout = styled.button`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0.7rem;
  height: 1.2rem;
  border: none;
  background-color: var(--white-color-1);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--black-color-1);
  cursor: pointer;

  &:not(:last-child) {
    border-right: 1px solid var(--gray-color-1);
  }
`;
export default Header;
