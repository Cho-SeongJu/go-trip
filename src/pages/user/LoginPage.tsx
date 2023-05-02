import styled from '@emotion/styled';
import Logo from '../../components/Logo';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <>
      <LoginSection>
        <Logo />
        <Form>
          <Input
            type="text"
            placeholder="아이디를 입력하세요."
          />
          <Input
            type="text"
            placeholder="비밀번호를 입력하세요."
          />
          <BtnSubmit>로그인</BtnSubmit>
        </Form>
        <FindSignUpSection>
          <FindSignUpLink to="/find">아이디 / 비밀번호 찾기</FindSignUpLink>
          <FindSignUpLink to="/user/signUp">회원가입</FindSignUpLink>
        </FindSignUpSection>
      </LoginSection>
    </>
  );
};

const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50rem;
  margin: 12rem auto 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  width: 16rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;

  &:first-of-type {
    margin-bottom: 0.5rem;
  }
`;

const BtnSubmit = styled.button`
  margin-top: 1rem;
  padding: 0.9rem;
  border: none;
  border-radius: 0.2rem;
  color: var(--white-color-1);
  font-size: 1rem;
  font-weight: 700;
  background-color: var(--blue-sky-color-1);
  cursor: pointer;
`;

const FindSignUpSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.2rem;
  width: 16rem;
`;

const FindSignUpLink = styled(Link)`
  font-size: 0.75rem;
  color: var(--gray-color-3);

  &:first-of-type {
    margin-right: 1rem;
  }
`;

export default LoginPage;
