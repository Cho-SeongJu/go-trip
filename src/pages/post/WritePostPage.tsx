import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore/lite';
import { ChangeEvent, FormEventHandler, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import ImgCarousel from '../../components/carousel/ImgCarosel';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';
import Header from '../../components/header/Header';
import { uid, userInfo } from '../../store/data';

interface PostFormType {
  title: string;
  content: string;
}

const WritePostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<string[]>([]);
  const [uploadImageName, setUploadImageName] = useState<string[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const loginUID = useRecoilValue(uid);
  const loginUserNickName = useRecoilValue(userInfo);
  const navigate = useNavigate();

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
    let postID = 0;
    try {
      if (querySnapShot.empty) {
        postID = 1;
        await setDoc(doc(database, 'posts', 'post' + String(postID)), {
          UID: loginUID,
          TITLE: title,
          CONTENT: content,
          NICKNAME: loginUserNickName.NICKNAME,
        });
      } else {
        const size = querySnapShot.size;
        const id = querySnapShot.docs[size - 1].id;
        postID = Number(id.substring(4, id.length));

        await setDoc(doc(database, 'posts', 'post' + String(postID + 1)), {
          UID: loginUID,
          TITLE: title,
          CONTENT: content,
          NICKNAME: loginUserNickName.NICKNAME,
        });
      }
      navigate(`/post/post${postID}`);
    } catch (error) {
      alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도하시길 바랍니다.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (textAreaRef.current !== null) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [watchContent]);

  const test = () => {
    console.log('asd');
  };

  const handleUploadImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return;

    const uploadImageList = event.target.files;
    const uploadImageNameList = uploadImageName.length === 0 ? [] : [...uploadImageName];

    for (let i = 0; i < uploadImageList.length; i++) {
      uploadImageNameList.push(uploadImageList[i].name);
    }

    setUploadImageName(uploadImageNameList);

    const imageURLList = uploadImage.length === 0 ? [] : [...uploadImage];

    for (let i = 0; i < uploadImageList.length; i++) {
      const url = URL.createObjectURL(uploadImageList[i]);
      imageURLList.push(url);
    }

    setUploadImage(imageURLList);
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
          <ImageSection>
            <ImgCarousel upload={uploadImage} />
            <ImageUploadSection>
              <ImageUploadLabel htmlFor="inputFile">
                이미지 추가
                <ImageUploadInput
                  type="file"
                  id="inputFile"
                  multiple
                  onChange={handleUploadImages}
                />
              </ImageUploadLabel>
              <ImageList>
                {uploadImageName.map((image) => (
                  <ImageName>{image}</ImageName>
                ))}
              </ImageList>
            </ImageUploadSection>
          </ImageSection>
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
  margin-top: 5rem;
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

const ImageSection = styled.div`
  display: flex;
  margin-top: 3rem;
`;

const ImageUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
  flex-grow: 1;
`;

const ImageUploadLabel = styled.label`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: var(--black-color-2);
  color: var(--white-color-1);
  text-align: center;
  border-radius: 2rem;
  cursor: pointer;
`;

const ImageUploadInput = styled.input`
  display: none;
`;

const ImageList = styled.div`
  height: 5rem;
  flex-grow: 1;
  overflow: auto;
`;

const ImageName = styled.p`
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid var(--gray-color-1);
  font-size: 0.9rem;
`;

const TextArea = styled.textarea`
  margin-top: 3rem;
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
