import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { database } from '../../../firebase';
import BtnSubmit from '../../components/BtnSubmit';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';
import { uid, userInfo } from '../../store/data';
import { FormValueType } from '../../type/type';
import { ChangeEvent } from 'react';

interface SignUpType extends FormValueType {
  address: string;
  nickName: string;
  reCheckPassword: string;
}

interface InfoType {
  email: string;
  nickname: string;
}

const CHECK_NICKNAME_ERROR_MSG = '이미 사용중인 닉네임입니다.';

const EditInfoPage = () => {
  const menu = ['editUserInfo', 'likeList'];
  const [loading, setLoading] = useState<boolean>(false);
  const [checkNickNameResultMsg, setCheckNickNameResultMsg] = useState<string>('');
  const [loginUserInfo, setLoginUserInfo] = useState<InfoType>({ email: '', nickname: '' });
  const [nickName, setNickName] = useState('');
  const userID = useRecoilValue(uid);
  const nickname = useRecoilValue(userInfo);
  const navigate = useNavigate();

  const getInfo = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null && user.email !== null) {
      const userInfo: InfoType = {
        email: user.email,
        nickname: nickname.NICKNAME,
      };
      setNickName(nickname.NICKNAME);
      setLoginUserInfo(userInfo);
    }
  };

  const formSchema = yup.object({
    nickName: yup.string().required('닉네임은 필수 입력입니다.').min(2, '최소 2자 필수 입력입니다.').max(8, '최대 8자 입력 가능합니다.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const onSubmit = async () => {
    if (checkNickNameResultMsg.length !== 0) return;
    setLoading(true);
    const signUpData = getValues();
    const nickName = signUpData.nickName;

    try {
      await setDoc(doc(database, 'users', userID), {
        NICKNAME: nickName,
      });
      alert('회원정보를 성공적으로 변경하였습니다.');
      navigate('/');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const checkNickName = async (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length === 0) {
      setCheckNickNameResultMsg('닉네임은 필수 입력입니다.');
      return;
    } else if (value.length < 2) {
      setCheckNickNameResultMsg('최소 2자 필수 입력입니다.');
      return;
    } else if (value.length > 8) {
      setCheckNickNameResultMsg('최대 8자 입력 가능합니다.');
      return;
    } else if (value === nickname.NICKNAME) {
      setCheckNickNameResultMsg('현재 닉네임입니다.');
      return;
    }

    const nickNamRef = collection(database, 'users');
    const q = query(nickNamRef, where('NICKNAME', '==', value));
    const querySnapShot = await getDocs(q);

    try {
      if (querySnapShot.docs.length !== 0) {
        setCheckNickNameResultMsg(CHECK_NICKNAME_ERROR_MSG);
      } else {
        setCheckNickNameResultMsg('');
      }
    } catch (error) {
      alert('오류가 발생하였습니다. 다시 진행해주시길 바랍니다.');
      return;
    }
  };

  const onChangeNicknameHandle = (e: ChangeEvent<HTMLInputElement>) => {
    setNickName(e.target.value);
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <>
      <Header />
      <Tab menu={menu} />
      <Section>
        <ProfileImageSection>
          <ProfileImage />
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Label>이메일</Label>
            <InputBox
              type="text"
              placeholder="이메일"
              id="email"
              {...register('email')}
              defaultValue={loginUserInfo['email']}
              disabled
            />
            {errors.email && <ErrorMessage role="alert">{errors.email.message}</ErrorMessage>}
            <Label>닉네임</Label>
            <InputBox
              type="text"
              placeholder="닉네임"
              id="nickname"
              {...register('nickName')}
              onBlur={checkNickName}
              // onChange={() => onChangeNicknameHandle}
              defaultValue={nickName}
            />
            {checkNickNameResultMsg.length !== 0 ? (
              <ErrorMessage role="alert">{checkNickNameResultMsg}</ErrorMessage>
            ) : (
              errors.nickName && <ErrorMessage role="alert">{errors.nickName.message}</ErrorMessage>
            )}
            <BtnSubmit>회원정보수정</BtnSubmit>
          </Form>
        </ProfileImageSection>
      </Section>
      <Footer />
      {loading && <Loading display={loading ? 'flex' : 'none'} />}
    </>
  );
};

const Section = styled.div`
  width: var(--common-post-width);
  margin: var(--common-margin);
  min-height: calc(100vh - 10rem - 3.2rem - 1.85rem);
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

const InputBox = styled.input`
  margin-bottom: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;
`;

const ProfileImageSection = styled.div``;

const ProfileImage = styled.img``;

export default EditInfoPage;
