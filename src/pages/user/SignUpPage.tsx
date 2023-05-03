import styled from '@emotion/styled';
import BtnSubmit from '../../components/BtnSubmit';
import Logo from '../../components/Logo';
import { useForm } from 'react-hook-form';

const SignUpPage = () => {
  interface FormValueType {
    email: string;
    password: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValueType>({ mode: 'onChange' });

  const onSubmit = () => {
    const signUpData = getValues();
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
              required: '이메일은 필수 입력입니다.',
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
              required: '비밀번호는 필수 입력입니다.',
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
          <Label>주소</Label>
          <InputBox
            type="text"
            placeholder="주소"
            id="address"
            name="address"
          />
          <Label>닉네임</Label>
          <Description>닉네임 중복확인은 필수사항입니다.</Description>
          <InputBox
            type="text"
            placeholder="닉네임"
            id="nickname"
            name="nickname"
          />
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
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;

  &:not(:last-of-type) {
    margin-bottom: 0.5rem;
  }
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
