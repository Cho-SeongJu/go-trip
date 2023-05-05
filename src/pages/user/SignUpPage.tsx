import styled from '@emotion/styled';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore/lite';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../../../firebase';
import BtnSubmit from '../../components/BtnSubmit';
import Logo from '../../components/Logo';
import { ErrorType, FormValueType } from '../../type/type';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Map from '../../components/map/Map';
import Loading from '../../components/Loading';
import { useState } from 'react';

interface SignUpType extends FormValueType {
  address: string;
  nickName: string;
  reCheckPassword: string;
}

const SignUpPage = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const formSchema = yup.object({
    email: yup.string().required('이메일은 필수 입력입니다.').email('이메일 형식이 아닙니다.'),
    password: yup
      .string()
      .required('비밀번호는 필수 입력입니다.')
      .min(8, '최소 8자 필수 입력입니다.')
      .max(16, '최대 16자 까지만 가능합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/, '영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.'),
    reCheckPassword: yup.string().oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.'),
    nickName: yup.string().required('닉네임은 필수 입력입니다.').min(3, '최소 3자 필수 입력입니다.').max(12, '최소 12자'),
    address: yup.string().required('주소는 필수 입력입니다.'),
  });

  const test = () => {
    console.log('asd');
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const onSubmit = async () => {
    setLoading(true);

    const signUpData = getValues();

    const email = signUpData.email;
    const password = signUpData.password;
    const nickName = signUpData.nickName;
    const address = signUpData.address;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(database, 'users', email), {
        NICKNAME: nickName,
        ADDRESS: address,
      });

      navigate('/user/signUp/success');
    } catch (error) {
      const err = error as ErrorType;
      switch (err.code) {
        case 'auth/weak-password':
          console.log('비밀번호는 6자리 이상이어야 합니다.');
          break;

        case 'auth/invalid-email':
          console.log('잘못된 이메일 주소입니다.');
          break;

        case 'auth/email-already-in-use':
          console.log('이미 가입되어 있는 계정입니다.');
          break;
      }
    }
  };

  return (
    <>
      <SignUpSection display={loading ? '' : 'block'}>
        <LogoSection>
          <Logo />
        </LogoSection>
        <Heading>회원가입</Heading>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Label>이메일</Label>
          <InputBox
            type="text"
            placeholder="이메일"
            id="email"
            {...register('email')}
          />
          {errors.email && <AlertMessage role="alert">{errors.email.message}</AlertMessage>}
          <Label>비밀번호</Label>
          <Description>영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.</Description>
          <InputBox
            type="password"
            placeholder="비밀번호"
            id="password"
            {...register('password')}
            onBlur={test}
          />
          {errors.password && <AlertMessage role="alert">{errors.password.message}</AlertMessage>}
          <InputBox
            type="password"
            placeholder="비밀번호 재확인"
            id="reCheckPassword"
            {...register('reCheckPassword')}
          />
          {errors.reCheckPassword && <AlertMessage role="alert">{errors.reCheckPassword.message}</AlertMessage>}
          <Label>닉네임</Label>
          <InputBox
            type="text"
            placeholder="닉네임"
            id="nickname"
            {...register('nickName', {
              required: { value: true, message: '닉네임은 필수 입력입니다.' },
            })}
          />
          {errors.nickName && <AlertMessage role="alert">{errors.nickName.message}</AlertMessage>}
          <Label>주소</Label>
          <InputBox
            type="text"
            placeholder="주소"
            id="address"
            {...register('address', {
              required: { value: true, message: '주소 입력은 필수 입력입니다.' },
            })}
          />
          {errors.address && <AlertMessage role="alert">{errors.address.message}</AlertMessage>}
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

const AlertMessage = styled.small`
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  color: var(--red-color-1);
`;

const Description = styled.p`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-color-3);
`;

export default SignUpPage;
