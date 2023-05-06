import styled from '@emotion/styled';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

const SuccessSignUp = () => {
  return (
    <>
      <Section>
        <Logo />
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
