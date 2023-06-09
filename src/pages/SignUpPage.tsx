import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore/lite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { auth, database } from '../../firebase';
import BtnSubmit from '../components/BtnSubmit';
import Loading from '../components/Loading';
import logo from '../../public/logo.svg';
import ErrorMessage from '../components/errorMessage/ErrorMesage';
import { ErrorType, FormValueType } from '../type/type';
import { getExpireTime } from '../store/date';
import { useCookies } from 'react-cookie';
import { uid } from '../store/data';
import { useRecoilValue } from 'recoil';

interface SignUpType extends FormValueType {
  address: string;
  nickName: string;
  reCheckPassword: string;
}

const SignUpPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [checkEmailResultMsg, setCheckEmailResultMsg] = useState<string>('');
  const [checkNickNameResultMsg, setCheckNickNameResultMsg] = useState<string>('');
  const [, setCookie] = useCookies(['uid']);
  const userId = useRecoilValue(uid);
  const navigate = useNavigate();

  const formSchema = yup.object({
    email: yup
      .string()
      .required('이메일은 필수 입력입니다.')
      .email('이메일 형식이 아닙니다.')
      .matches(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/, '이메일 형식이 아닙니다.'),
    password: yup
      .string()
      .required('비밀번호는 필수 입력입니다.')
      .min(8, '최소 8자 필수 입력입니다.')
      .max(16, '최대 16자 까지만 가능합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/, '영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.'),
    reCheckPassword: yup
      .string()
      .required('비밀번호 재확인은 필수 입력입니다.')
      .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.'),
    nickName: yup.string().required('닉네임은 필수 입력입니다.').min(2, '최소 2자 필수 입력입니다.').max(8, '최대 8자 입력 가능합니다.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const checkEmail = async (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const id = value.slice(0, value.indexOf('@'));

    if (value.length === 0) {
      setCheckEmailResultMsg('이메일은 필수 입력입니다.');
      return;
    }

    if (id.length < 6) {
      setCheckEmailResultMsg('이메일은 최소 6글자 이상 필수 입력입니다.');
      return;
    } else if (id.length > 16) {
      setCheckEmailResultMsg('이메일은 최대 16글자 입력 가능합니다..');
      return;
    }

    const emailRef = collection(database, 'users');
    const q = query(emailRef, where('EMAIL', '==', value));

    try {
      const querySnapShot = await getDocs(q);
      if (querySnapShot.docs.length !== 0) {
        setCheckEmailResultMsg('이미 사용중인 이메일입니다.');
      } else {
        setCheckEmailResultMsg('');
      }
    } catch (error) {
      alert('중복체크 중 오류가 발생하였습니다. 다시 진행해주시길 바랍니다.');
      return;
    }
  };

  const checkNickName = async (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length === 0) {
      setCheckNickNameResultMsg('닉네임은 필수 입력입니다.');
      return;
    }

    if (value.length < 2) {
      setCheckNickNameResultMsg('최소 2자 필수 입력입니다.');
      return;
    }

    if (value.length > 8) {
      setCheckNickNameResultMsg('최대 8자 입력 가능합니다.');
      return;
    }

    const nickNamRef = collection(database, 'users');
    const q = query(nickNamRef, where('NICKNAME', '==', value));

    try {
      const querySnapShot = await getDocs(q);
      if (querySnapShot.docs.length !== 0) {
        setCheckNickNameResultMsg('이미 사용중인 닉네임입니다.');
      } else {
        setCheckNickNameResultMsg('');
      }
    } catch (error) {
      alert('중복체크 중 오류가 발생하였습니다. 다시 진행해주시길 바랍니다.');
      return;
    }
  };

  const onSubmit = async () => {
    if (checkNickNameResultMsg.length !== 0) return;
    setLoading(true);

    const signUpData = getValues();

    const email = signUpData.email;
    const password = signUpData.password;
    const nickName = signUpData.nickName;

    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      const userUID = user.user.uid;
      await setDoc(doc(database, 'users', userUID), {
        EMAIL: email,
        NICKNAME: nickName,
        UID: userUID,
        PROFILE_IMAGE: '',
        PROFILE_IMAGE_NAME: '',
      });

      navigate('/user/signUp/success');
    } catch (error) {
      const err = error as ErrorType;
      switch (err.code) {
        case 'auth/invalid-email':
          console.log('잘못된 이메일 주소입니다.');
          break;

        case 'auth/email-already-in-use':
          console.log('이미 가입되어 있는 계정입니다.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', userId, { path: '/', expires: expireTime });
  };

  return (
    <>
      <SignUpSection display={loading ? '' : 'block'}>
        <LogoSection>
          <LogoHeading>
            <HomeLink
              onClick={setCookieHandle}
              to="/"
            >
              <img
                src={logo}
                alt=""
              />
            </HomeLink>
          </LogoHeading>
        </LogoSection>
        <Heading>회원가입</Heading>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Label>이메일</Label>
          <InputBox
            type="text"
            placeholder="이메일"
            id="email"
            {...register('email')}
            onBlur={checkEmail}
          />
          {checkEmailResultMsg.length !== 0 ? <ErrorMessage role="alert">{checkEmailResultMsg}</ErrorMessage> : errors.email && <ErrorMessage role="alert">{errors.email.message}</ErrorMessage>}
          <Label>비밀번호</Label>
          <Description>영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.</Description>
          <InputBox
            type="password"
            placeholder="비밀번호"
            id="password"
            {...register('password')}
          />
          {errors.password && <ErrorMessage role="alert">{errors.password.message}</ErrorMessage>}
          <InputBox
            type="password"
            placeholder="비밀번호 재확인"
            id="reCheckPassword"
            {...register('reCheckPassword')}
          />
          {errors.reCheckPassword && <ErrorMessage role="alert">{errors.reCheckPassword.message}</ErrorMessage>}
          <Label>닉네임</Label>
          <InputBox
            type="text"
            placeholder="닉네임"
            id="nickname"
            {...register('nickName')}
            onBlur={checkNickName}
          />
          {checkNickNameResultMsg.length !== 0 ? (
            <ErrorMessage role="alert">{checkNickNameResultMsg}</ErrorMessage>
          ) : (
            errors.nickName && <ErrorMessage role="alert">{errors.nickName.message}</ErrorMessage>
          )}
          <BtnSubmit>회원가입</BtnSubmit>
        </Form>
      </SignUpSection>
      {loading && <Loading display={loading ? 'flex' : 'none'} />}
    </>
  );
};

const SignUpSection = styled.div<{ display: string }>`
  display: ${(props) => props.display};
  width: 20rem;
  margin: 0 auto;
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5rem;
  width: 20rem;
`;

const LogoHeading = styled.h1`
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

const Heading = styled.h1`
  margin-top: 3rem;
  font-size: 1.4rem;
  font-weight: 700;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 3rem;
  width: 20rem;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 700;

  &:not(:first-of-type) {
    margin-top: 0.5rem;
  }
`;

const InputBox = styled.input`
  margin-bottom: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;
`;

const Description = styled.p`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-color-3);
`;

export default SignUpPage;
