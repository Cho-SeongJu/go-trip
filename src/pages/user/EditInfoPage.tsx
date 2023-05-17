import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { getAuth } from 'firebase/auth';
import { DocumentData, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore/lite';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
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
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { myPagemenu } from '../../store/menu';

interface SignUpType extends FormValueType {
  address: string;
  nickName: string;
  reCheckPassword: string;
}

interface InfoType {
  email: string;
  nickname: string;
}

interface ImageObjType {
  profileImage: string;
  profileImageName: string;
  profileImageFile: File | null;
}

const CHECK_NICKNAME_ERROR_MSG = '이미 사용중인 닉네임입니다.';

const EditInfoPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [checkNickNameResultMsg, setCheckNickNameResultMsg] = useState<string>('');
  const [loginUserInfo, setLoginUserInfo] = useState<InfoType>({ email: '', nickname: '' });
  const [nickName, setNickName] = useState('');
  const [initImageName, setInitImageName] = useState<string>('');
  const [profileExist, setProfileExist] = useState<boolean>(false);
  const [profileImageObj, setProfileImageObj] = useState<ImageObjType>({ profileImage: '', profileImageName: '', profileImageFile: null });
  const setUserInfo = useSetRecoilState(userInfo);
  const userID = useRecoilValue(uid);
  const currentNickname = useRecoilValue(userInfo);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const getInfo = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const docRef = doc(database, 'users', userID);
    try {
      setLoading(true);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        if (docSnap.data().PROFILE_IMAGE === '') {
          setProfileImageObj({ profileImage: '', profileImageName: '', profileImageFile: null });
          console.log(1);
        } else {
          setProfileImageObj({ profileImage: docSnap.data().PROFILE_IMAGE, profileImageName: docSnap.data().PROFILE_IMAGE_NAME, profileImageFile: null });
          setInitImageName(docSnap.data().PROFILE_IMAGE_NAME);
          setProfileExist(true);
          console.log(2);
        }
      }
    } catch {
      alert('조회 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }

    if (user !== null && user.email !== null) {
      const userInfo: InfoType = {
        email: user.email,
        nickname: currentNickname.NICKNAME,
      };
      setNickName(currentNickname.NICKNAME);
      setLoginUserInfo(userInfo);
    }
  };

  const formSchema = yup.object({
    // nickName: yup.string().required('닉네임은 필수 입력입니다.').min(2, '최소 2자 필수 입력입니다.').max(8, '최대 8자 입력 가능합니다.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const onSubmit = async () => {
    if (checkNickNameResultMsg.length !== 0) return;
    const signUpData = getValues();
    const signUpnickName = nicknameRef.current?.value;
    if (!profileExist && profileImageObj.profileImage === '' && nickName === signUpnickName) {
      console.log(signUpData.nickName);
      console.log(signUpnickName);
      alert('변경된 정보가 없습니다.');
      return;
    }
    setLoading(true);

    try {
      const storage = getStorage();
      const userRef = doc(database, 'users', userID);

      if (profileExist && profileImageObj.profileImage === '') {
        console.log('qwe');
        const deleteRef = ref(storage, `images/users/${userID}/${initImageName}`);

        await deleteObject(deleteRef);

        await updateDoc(doc(database, 'users', userID), {
          NICKNAME: signUpnickName,
          PROFILE_IMAGE: '',
          PROFILE_IMAGE_NAME: '',
        });
      } else if (!profileExist && profileImageObj.profileImage === '') {
        console.log('asd');
        await updateDoc(userRef, {
          NICKNAME: signUpnickName,
          PROFILE_IMAGE: '',
          PROFILE_IMAGE_NAME: '',
        });
      } else {
        const imageRef = `images/users/${userID}/${profileImageObj.profileImageName}`;
        const storageRef = ref(storage, imageRef);

        if (profileImageObj.profileImageFile !== null) {
          await uploadBytes(storageRef, profileImageObj.profileImageFile);
        }
        const imageURL = await getDownloadURL(ref(storage, `images/users/${userID}/${profileImageObj.profileImageName}`));

        await updateDoc(userRef, {
          NICKNAME: signUpnickName,
          PROFILE_IMAGE: imageURL,
          PROFILE_IMAGE_NAME: profileImageObj.profileImageName,
        });
      }
      const postRef = collection(database, 'posts');
      const commentRef = collection(database, 'comments');

      const postQuery = query(postRef, where('NICKNAME', '==', currentNickname.NICKNAME));
      const commentQuery = query(commentRef, where('nickname', '==', currentNickname.NICKNAME));

      const postQuerySnapShot = await getDocs(postQuery);
      const postData = postQuerySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));

      const commentQuerySnapShot = await getDocs(commentQuery);
      const commentData = commentQuerySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));

      if (postData.length !== 0) {
        postData.forEach((post: DocumentData) => {
          post.NICKNAME = signUpnickName;
        });

        postData.forEach(async (post) => {
          await setDoc(doc(database, 'posts', post.ID), post);
        });
      }

      if (commentData.length !== 0) {
        commentData.forEach((post: DocumentData) => {
          post.nickname = signUpnickName;
        });

        commentData.forEach(async (post) => {
          await setDoc(doc(database, 'comments', post.ID), post);
        });
      }

      if (signUpnickName !== undefined) setUserInfo({ NICKNAME: signUpnickName });
      alert('회원정보를 성공적으로 변경하였습니다.');
      navigate('/');
    } catch (error) {
      console.log(error);
      alert('처리 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const checkNickName = async (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log(value);
    if (value.length === 0) {
      setCheckNickNameResultMsg('닉네임은 필수 입력입니다.');
      return;
    } else if (value.length < 2) {
      setCheckNickNameResultMsg('최소 2자 필수 입력입니다.');
      return;
    } else if (value.length > 8) {
      setCheckNickNameResultMsg('최대 8자 입력 가능합니다.');
      return;
    }
    // } else if (value === nickName) {
    //   setCheckNickNameResultMsg('현재 닉네임입니다.');
    //   return;
    // }

    const nickNamRef = collection(database, 'users');
    const q = query(nickNamRef, where('NICKNAME', '==', value));
    const querySnapShot = await getDocs(q);

    if (nickName !== value) {
      console.log('asd');
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
    } else if (nickName === value) {
      setCheckNickNameResultMsg('');
    }
  };

  const imageChangeHandle = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      if (event.target.files.length === 0) return;
      const uploadImage = event.target.files[0];
      const imageURL = URL.createObjectURL(uploadImage);
      console.log(uploadImage.name);
      setProfileImageObj({ profileImage: imageURL, profileImageName: uploadImage.name, profileImageFile: uploadImage });
    }
  };

  const imageDeleteHandle = () => {
    setProfileImageObj({ profileImage: '', profileImageName: '', profileImageFile: null });
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <>
      <Header />
      <Tab menu={myPagemenu} />
      <Section>
        <ProfileSection>
          <ImageSection>
            <ProfileImageSection>
              <InputImageLabel htmlFor="profileImage">
                {profileImageObj.profileImage === '' ? (
                  <svg
                    width="20rem"
                    height="10rem"
                    viewBox="0 0 16 16"
                    fill="var(--gray-color-2)"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683z"
                    />
                    <path d="M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                  </svg>
                ) : (
                  <ProfileImage src={profileImageObj.profileImage} />
                )}
              </InputImageLabel>

              {profileImageObj.profileImage !== '' && <BtnImageDelete onClick={imageDeleteHandle}>삭제</BtnImageDelete>}
              <InputImage
                type="file"
                id="profileImage"
                onChange={imageChangeHandle}
              />
            </ProfileImageSection>
          </ImageSection>
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
              defaultValue={nickName}
              ref={nicknameRef}
            />
            {checkNickNameResultMsg.length !== 0 ? (
              <ErrorMessage role="alert">{checkNickNameResultMsg}</ErrorMessage>
            ) : (
              errors.nickName && <ErrorMessage role="alert">{errors.nickName.message}</ErrorMessage>
            )}
            <BtnSubmit>회원정보수정</BtnSubmit>
          </Form>
        </ProfileSection>
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

const InputBox = styled.input`
  margin-bottom: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;
`;

const ProfileSection = styled.div``;

const ImageSection = styled.div`
  width: var(--common-post-width);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
`;

const InputImageLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12rem;
  height: 12rem;
  border-radius: 100%;
  cursor: pointer;
`;

const InputImage = styled.input`
  display: none;
`;

const ProfileImageSection = styled.div`
  position: relative;
  width: 12rem;
  height: 12rem;
  border: 1px solid var(--gray-color-2);
  border-radius: 100%;
  text-align: center;
  background-color: var(--white-color-1);

  &:hover svg {
    fill: rgba(239, 239, 239, 0.9);
  }

  &:hover img {
    opacity: 0.5;
  }
`;

const BtnImageDelete = styled.button`
  position: absolute;
  top: 15%;
  right: 20%;
  border: none;
  border-radius: 0.2rem;
  background-color: var(--blue-sky-color-1);
  padding: 0.3rem 0.5rem;
  color: var(--white-color-1);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 12rem;
  height: 12rem;
  object-fit: contain;
  border-radius: 100%;
`;

export default EditInfoPage;
