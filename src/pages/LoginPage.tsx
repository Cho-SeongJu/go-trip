import styled from '@emotion/styled';
import { GoogleAuthProvider, browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { auth, database } from '../../firebase';
import BtnSubmit from '../components/BtnSubmit';
import logo from '../../public/logo.svg';
import ErrorMessage from '../components/errorMessage/ErrorMesage';
import { uid, userInfo } from '../store/data';
import { ErrorType, FormValueType } from '../type/type';
import { getExpireTime } from '../store/date';

type ErrorMsgType = string;

const LoginPage = () => {
  const [, setCookie] = useCookies(['uid']);
  const [errorMsg, setErrorMsg] = useState<ErrorMsgType>();
  const [clickLoginBtn, setClickLoginBtn] = useState<boolean>(false);
  const setLoginUserInfo = useSetRecoilState(userInfo);
  const setUID = useSetRecoilState(uid);
  const userId = useRecoilValue(uid);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValueType>({ mode: 'onBlur' });

  const login = async () => {
    const loginInfo = getValues();
    const loginEmail = loginInfo.email;
    const loginPassword = loginInfo.password;

    try {
      if (clickLoginBtn) return;

      setClickLoginBtn(true);
      await setPersistence(auth, browserSessionPersistence);

      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const uid = user.user.uid;

      const docRef = doc(database, 'users', uid);
      const docSnap = await getDoc(docRef);

      setUID(uid);

      const nickname = docSnap.data();

      if (nickname !== undefined) {
        const obj = {
          NICKNAME: nickname['NICKNAME'],
        };
        setLoginUserInfo(obj);
      }

      console.log('로그인 성공');
      const expireTime = getExpireTime();
      setCookie('uid', uid, { path: '/', expires: expireTime });
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

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential !== null) {
        const user = result.user;
        const userUID = user.uid;
        const docRef = doc(database, 'users', userUID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          await setDoc(doc(database, 'users', userUID), {
            EMAIL: user.email,
            NICKNAME: user.displayName,
            UID: userUID,
            PROFILE_IMAGE: '',
            PROFILE_IMAGE_NAME: '',
          });
          setUID(userUID);

          if (user.displayName !== null) {
            const obj = {
              NICKNAME: user.displayName,
            };
            setLoginUserInfo(obj);
          }
        } else {
          setUID(userUID);
          const nickname = docSnap.data();

          if (nickname !== undefined) {
            const obj = {
              NICKNAME: nickname['NICKNAME'],
            };
            setLoginUserInfo(obj);
          }
        }

        const expireTime = getExpireTime();
        setCookie('uid', userUID, { path: '/', expires: expireTime });
        navigate('/');
      }
    } catch (error) {
      alert(error);
    }
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', userId, { path: '/', expires: expireTime });
  };

  return (
    <>
      <LoginSection>
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
        <GoogleLogin onClick={googleLogin}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="25px"
            height="25px"
          >
            <path
              fill="#fbc02d"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#e53935"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4caf50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1565c0"
              d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          <GooglePharse>Google 로그인</GooglePharse>
        </GoogleLogin>
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

const GoogleLogin = styled.button`
  display: flex;
  margin-top: 1rem;
  padding: 0.9rem;
  border: none;
  border-radius: 0.2rem;
  color: var(--white-color-1);
  font-size: 1rem;
  font-weight: 700;
  background-color: var(--gray-color-2);
  cursor: pointer;
  width: 16rem;
`;

const GooglePharse = styled.span`
  margin-left: 2rem;
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
