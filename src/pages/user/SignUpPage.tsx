import styled from '@emotion/styled';
import Input from '../../components/Input';
import BtnSubmit from '../../components/BtnSubmit';
import Logo from '../../components/Logo';

const SignUpPage = () => {
  return (
    <>
      <SignUpSection>
        <LogoSection>
          <Logo />
        </LogoSection>
        <Heading>회원가입</Heading>
        <Form action="post">
          <Label>이메일</Label>
          <Description>이메일 중복확인은 필수사항입니다.</Description>
          <Input
            type="text"
            placeholder="이메일"
          />
          <Label>비밀번호</Label>
          <Description>영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.</Description>
          <Input
            type="password"
            placeholder="비밀번호"
          />
          <Input
            type="password"
            placeholder="비밀번호 재확인"
          />
          <Label>주소</Label>
          <Input
            type="text"
            placeholder="주소"
          />
          <Label>닉네임</Label>
          <Description>닉네임 중복확인은 필수사항입니다.</Description>
          <Input
            type="text"
            placeholder="닉네임"
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

const Description = styled.p`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-color-3);
`;

export default SignUpPage;
