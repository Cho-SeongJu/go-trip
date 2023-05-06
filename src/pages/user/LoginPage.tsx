import styled from '@emotion/styled';
import Logo from '../../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import BtnSubmit from '../../components/BtnSubmit';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import { useForm } from 'react-hook-form';
import { ErrorType, FormValueType } from '../../type/type';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';

type ErrorMsgType = string;

const LoginPage = () => {
  const [errorMsg, setErrorMsg] = useState<ErrorMsgType>();
  const [cookies, setCookie] = useCookies(['id']);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValueType>({ mode: 'onBlur' });

  const checkLoginError = () => {
    if (Object.keys(errors).length !== 0) {
      if (errors.email) {
        setErrorMsg(errors.email.message);
      }

      if (!errors.email && errors.password) {
        setErrorMsg(errors.password.message);
      }

      if (errorMsg === undefined) {
        setErrorMsg('');
      }
    }
  };

  const login = async () => {
    checkLoginError();
    const loginInfo = getValues();
    console.log(errorMsg);
    const loginEmail = loginInfo.email;
    const loginPassword = loginInfo.password;

    console.log(loginEmail);
    console.log(loginPassword);

    try {
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log(user);
      console.log('로그인 성공');
      console.log(auth);
      navigate('/');
    } catch (error) {
      const err = error as ErrorType;
      console.log(err);
    }
  };

  return (
    <>
      <LoginSection>
        <Logo />
        <Form onSubmit={handleSubmit(login)}>
          <InputBox
            type="text"
            placeholder="아이디를 입력하세요."
            id="email"
            {...register('email', {
              required: { value: true, message: '이메일 입력을 해주세요.' },
            })}
          />
          <InputBox
            type="password"
            placeholder="비밀번호를 입력하세요."
            id="password"
            {...register('password', {
              required: { value: true, message: '비밀번호를 입력해주세요.' },
            })}
          />
          <BtnSubmit>로그인</BtnSubmit>
        </Form>
        {errorMsg === undefined && <ErrorMessage role="alert">{errorMsg}</ErrorMessage>}
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

const InputBox = styled.input`
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;

  &:not(:last-of-type) {
    margin-bottom: 0.5rem;
  }
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
