import styled from '@emotion/styled';
import BtnSubmit from '../../components/BtnSubmit';
import Logo from '../../components/Logo';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../../../firebase';
import { ErrorType, FormValueType } from '../../type/type';
import { doc, setDoc } from 'firebase/firestore/lite';

interface SignUpType extends FormValueType {
  address: string;
  nickName: string;
}

const SignUpPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpType>({ mode: 'onBlur' });

  const onSubmit = async () => {
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

      console.log('회원가입 성공 ! ');
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
      <SignUpSection>
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
            {...register('email', {
              required: { value: true, message: '이메일은 필수 입력입니다.' },
              pattern: {
                value: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
                message: '이메일 형식에 맞지 않습니다.',
              },
            })}
          />
          {errors.email && <AlertMessage role="alert">{errors.email.message}</AlertMessage>}
          <Label>비밀번호</Label>
          <Description>영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.</Description>
          <InputBox
            type="password"
            placeholder="비밀번호"
            id="password"
            {...register('password', {
              required: { value: true, message: '비밀번호는 필수 입력입니다.' },
              minLength: {
                value: 8,
                message: '8자리 이상 비밀번호를 입력하세요',
              },
            })}
          />
          {errors.password && <AlertMessage role="alert">{errors.password.message}</AlertMessage>}
          <InputBox
            type="password"
            placeholder="비밀번호 재확인"
            id="reCheckPassword"
            name="reCheckPassword"
          />
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
    </>
  );
};

const SignUpSection = styled.div`
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
