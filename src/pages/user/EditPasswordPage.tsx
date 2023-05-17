import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import BtnSubmit from '../../components/BtnSubmit';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';
import { ErrorType, FormValueType } from '../../type/type';
import Loading from '../../components/Loading';
import { myPagemenu } from '../../store/menu';

interface SignUpType extends FormValueType {
  currentPassword: string;
  reCheckPassword: string;
}

const EditPasswordPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const formSchema = yup.object({
    currentPassword: yup
      .string()
      .required('현재 비밀번호는 필수 입력입니다.')
      .min(8, '최소 8자 필수 입력입니다.')
      .max(16, '최대 16자 까지만 가능합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/, '영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.'),
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
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const onSubmit = async () => {
    setLoading(true);
    console.log('asd');
    const signUpData = getValues();
    const currentPassword = signUpData.currentPassword;
    const password = signUpData.password;

    const auth = getAuth();
    const user = auth.currentUser;

    const newPassword = password;
    try {
      if (user !== null && user.email !== null) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }
      alert('비밀번호를 성공적으로 변경하였습니다.');
      navigate('/');
    } catch (error) {
      const err = error as ErrorType;

      if (err.code === 'auth/wrong-password') {
        alert('현재 비밀번호가 일치하지 않습니다.');
      } else {
        alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Tab menu={myPagemenu} />
      <Section>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Label>비밀번호</Label>
          <Description>영문, 숫자, 특수문자를 포함한 8~16자 비밀번호를 입력해주세요.</Description>
          <InputBox
            type="password"
            placeholder="현재 비밀번호"
            id="currentPassword"
            {...register('currentPassword')}
          />
          {errors.currentPassword && <ErrorMessage role="alert">{errors.currentPassword.message}</ErrorMessage>}
          <InputBox
            type="password"
            placeholder="새 비밀번호"
            id="password"
            {...register('password')}
          />
          {errors.password && <ErrorMessage role="alert">{errors.password.message}</ErrorMessage>}
          <InputBox
            type="password"
            placeholder="새 비밀번호 재확인"
            id="reCheckPassword"
            {...register('reCheckPassword')}
          />
          {errors.reCheckPassword && <ErrorMessage role="alert">{errors.reCheckPassword.message}</ErrorMessage>}
          <BtnSubmit>비밀번호변경</BtnSubmit>
        </Form>
      </Section>
      <Footer />
      {loading && <Loading display={loading ? 'flex' : 'none'} />}
    </>
  );
};

const Section = styled.div`
  width: var(--common-post-width);
  margin: var(--common-margin);
  min-height: calc(100vh - 10rem - 3.2rem - 5rem);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: var(--common-margin);
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

const InputBox = styled.input`
  margin-bottom: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;
`;

export default EditPasswordPage;
