import styled from '@emotion/styled';
import logo from '../../public/logo.svg';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { uid } from '../store/data';
import { useRecoilValue } from 'recoil';
import { getExpireTime } from '../store/date';

const SuccessSignUp = () => {
  const [, setCookie] = useCookies(['uid']);
  const userId = useRecoilValue(uid);

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', userId, { path: '/', expires: expireTime });
  };

  return (
    <>
      <Section>
        <Heading>
          <HomeLink
            onClick={setCookieHandle}
            to="/"
          >
            <img
              src={logo}
              alt=""
            />
          </HomeLink>
        </Heading>
        <PharseSection>
          <WelcomePharse>환영합니다 !</WelcomePharse>
          <Pharse>회원가입을 축하드립니다.</Pharse>
          <Pharse>같이 여행을 떠나볼까요 ?</Pharse>
        </PharseSection>
        <ButtonSection>
          <Button to={'/'}>홈페이지</Button>
          <Button to={'/user/login'}>로그인</Button>
        </ButtonSection>
      </Section>
    </>
  );
};

const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
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
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const PharseSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 30rem;
  height: 10rem;
  border-radius: 1rem;
`;

const WelcomePharse = styled.p`
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Pharse = styled.p`
  font-size: 1rem;

  &:not(:first-of-type) {
    margin-top: 0.5rem;
  }
`;

const ButtonSection = styled.div`
  display: flex;
`;

const Button = styled(Link)`
  display: block;
  padding: 1rem;
  width: 5rem;
  text-align: center;
  color: var(--white-color-1);
  background-color: var(--blue-sky-color-1);
  border-radius: 0.3rem;
  cursor: pointer;
  transition: background-color 0.1s linear;

  &:first-of-type {
    margin-right: 1rem;
  }

  &:hover {
    background-color: var(--blue-sky-color-2);
  }
`;

export default SuccessSignUp;
