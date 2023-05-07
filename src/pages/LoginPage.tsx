import styled from '@emotion/styled';
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import BtnSubmit from '../components/BtnSubmit';
import Logo from '../components/Logo';
import ErrorMessage from '../components/errorMessage/ErrorMesage';
import { ErrorType, FormValueType } from '../type/type';
import { useSetRecoilState } from 'recoil';
import { uid } from '../store/data';

type ErrorMsgType = string;

const LoginPage = () => {
  const [cookies, setCookie] = useCookies(['uid']);
  const [errorMsg, setErrorMsg] = useState<ErrorMsgType>();
  const [clickLoginBtn, setClickLoginBtn] = useState<boolean>(false);
  const setUID = useSetRecoilState(uid);
  const navigate = useNavigate();

  const nowTime = new Date();
  const expireTime = new Date();

  expireTime.setMinutes(nowTime.getMinutes() + 60);

  useEffect(() => {
    console.log(cookies);
  }, [cookies]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValueType>({ mode: 'onBlur' });

  const login = async () => {
    const loginInfo = getValues();
    console.log(errorMsg);
    const loginEmail = loginInfo.email;
    const loginPassword = loginInfo.password;

    console.log(loginEmail);
    console.log(loginPassword);

    try {
      if (clickLoginBtn) return;
      setClickLoginBtn(true);
      await setPersistence(auth, browserSessionPersistence);
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log(user);
      const uid = auth.currentUser?.uid as string;

      setCookie('uid', uid, { path: '/', expires: expireTime });
      setUID(uid);
      console.log('로그인 성공');
      navigate('/');
    } catch (error) {
      const err = error as ErrorType;

      switch (err.code) {
        case 'auth/wrong-password':
          setErrorMsg('아이디나 비밀번호가 일치하지 않습니다.');
          break;

        case 'auth/user-not-found':
          setErrorMsg('존재하지 않은 정보입니다.');
          break;
      }
    } finally {
      setClickLoginBtn(false);
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
          {errors && <ErrorMessage role="alert">{errors.email ? errors.email.message : errors.password && errors.password.message}</ErrorMessage>}
          {errorMsg && <ErrorMessage role="alert">{errorMsg}</ErrorMessage>}
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

const InputBox = styled.input`
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;

  margin-bottom: 0.5rem;
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
