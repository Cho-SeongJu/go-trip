import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore/lite';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';
import Header from '../../components/header/Header';
import { uid, userInfo } from '../../store/data';
import { Carousel } from 'react-responsive-carousel';

interface PostFormType {
  title: string;
  content: string;
}

const WritePostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [myImage, setMyImage] = useState<string[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const loginUID = useRecoilValue(uid);
  const loginUserNickName = useRecoilValue(userInfo);

  const formSchema = yup.object({
    title: yup.string().required('제목은 필수 입력입니다.').min(6, '최소 6자 필수 입력입니다.').max(80, '최대 80자까지 입력 가능합니다.'),
    // content: yup.string().required('내용은 필수 입력입니다.').min(10, '최소 10자 필수 입력입니다.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<PostFormType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const { ref, ...rest } = register('content');

  const watchTitle = watch('title');
  const watchContent = watch('content');

  useEffect(() => {
    if (typeof watchTitle === 'string') {
      setTitleLength(watchTitle.length);
    }
  }, [watchTitle]);

  const onSubmit = async () => {
    setLoading(true);
    const title = getValues().title;
    const content = getValues().content;
    const querySnapShot = await getDocs(collection(database, 'posts'));
    try {
      if (querySnapShot.empty) {
        await setDoc(doc(database, 'posts', '1'), {
          UID: loginUID,
          TITLE: title,
          CONTENT: content,
          NICKNAME: loginUserNickName.NICKNAME,
        });
      } else {
        const size = querySnapShot.size;
        const lastID = Number(querySnapShot.docs[size - 1].id);

        await setDoc(doc(database, 'posts', String(lastID + 1)), {
          UID: loginUID,
          TITLE: title,
          CONTENT: content,
          NICKNAME: loginUserNickName.NICKNAME,
        });
      }
    } catch (error) {
      alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도하시길 바랍니다.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(watchContent);
    if (textAreaRef.current !== null) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [watchContent]);

  const test = () => {
    console.log('asd');
  };

  const uploadImg = (event: ChangeEvent<HTMLInputElement>) => {
    const nowSelectImageList = event.target.files;
    const nowImageURLList = [...myImage];

    if (nowSelectImageList != null) {
      for (let i = 0; i < nowSelectImageList.length; i += 1) {
        const nowImageUrl = URL.createObjectURL(nowSelectImageList[i]);
        nowImageURLList.push(nowImageUrl);
      }
    }

    setMyImage(nowImageURLList);
  };

  return (
    <>
      <Header />
      <WritePostSection>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <TitleSection>
            <TitleInputBox
              type="text"
              placeholder="제목을 입력하세요."
              //   onChange={onChangeHadler}
              id="title"
              {...register('title')}
            />
            <TitleLength>{titleLength} / 80</TitleLength>
          </TitleSection>
          {errors.title && <ErrorMessage role="alert">{errors.title.message}</ErrorMessage>}
          <ImgUploadSection>
            <Carousel />
          </ImgUploadSection>
          <TextArea
            placeholder="내용을 입력하세요."
            // onChange={handleResizeHeight}
            rows={1}
            id="content"
            {...register('content')}
            // ref={textAreaRef}
          />
          {errors.content && <ErrorMessage role="alert">{errors.content.message}</ErrorMessage>}
          <ButtonSection>
            <Button
              color="var(--blue-sky-color-1)"
              onClick={test}
            >
              저장
            </Button>
            <Button
              type="button"
              color="var(--gray-color-3)"
            >
              취소
            </Button>
          </ButtonSection>
        </Form>
      </WritePostSection>
      {loading && <Loading display={loading ? 'flex' : 'none'} />}
    </>
  );
};

const WritePostSection = styled.div`
  flex-direction: column;
  width: 50rem;
  margin: var(--common-margin);
`;

const TitleSection = styled.div`
  display: flex;
  border-bottom: 1px solid var(--gray-color-3);
  margin: 1rem 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TitleInputBox = styled.input`
  flex-grow: 1;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 2;
  border: none;
  outline: none;

  &::placeholder {
    font-weight: 500;
    color: var(--gray-color-3);
  }
`;

const TitleLength = styled.span`
  line-height: 2;
  font-size: 1.7rem;
  color: var(--gray-color-3);
`;

const ImgUploadSection = styled.div``;

const TextArea = styled.textarea`
  margin: 1rem 0;
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.5;
  border: none;
  border-bottom: 1px solid var(--gray-color-3);
  resize: none;
  outline: none;

  &::placeholder {
    font-size: 0.9rem;
  }
`;

const ButtonSection = styled.div`
  margin-top: 2rem;
`;

const Button = styled.button`
  float: right;
  margin-right: 0.5rem;
  padding: 0.8rem 1rem;
  background-color: ${(props) => props.color};
  border: none;
  border-radius: 5%;
  font-size: 1rem;
  color: var(--white-color-1);
  cursor: pointer;
`;

export default WritePostPage;
