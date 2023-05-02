import styled from '@emotion/styled';
import Input from '../../components/Input';
import BtnSubmit from '../../components/BtnSubmit';

const SignUpPage = () => {
  return (
    <>
      <SignUpSection>
        <Form action="post">
          <Input
            type="text"
            placeholder="아이디"
          />
          <Input
            type="text"
            placeholder="비밀번호"
          />
          <Input
            type="text"
            placeholder="이름"
          />
          <Input
            type="text"
            placeholder="주소"
          />
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
  width: 10rem;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 16rem;
`;

export default SignUpPage;
