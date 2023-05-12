import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore/lite';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
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

type DateType = string | number;

const WritePostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<string[]>([]);
  const [uploadImageName, setUploadImageName] = useState<string[]>([]);
  const [uploadImageFile, setUploadImageFile] = useState<FileList>();
  // const [imageURL, setImageURL] = useState<string>('');
  const loginUID = useRecoilValue(uid);
  const loginUserNickName = useRecoilValue(userInfo);
  const navigate = useNavigate();

  const formSchema = yup.object({
    title: yup.string().required('제목 입력은 필수입니다.').min(6, '최소 6자 필수 입력입니다.').max(80, '최대 80자까지 입력 가능합니다.'),
    content: yup.string().required('내용 입력은 필수입니다.').min(12, '최소 12자 필수 입력입니다.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<PostFormType>({ mode: 'onBlur', resolver: yupResolver(formSchema) });

  const watchTitle = watch('title');

  useEffect(() => {
    if (typeof watchTitle === 'string') {
      setTitleLength(watchTitle.length);
    }
    const today = new Date();
    today.setHours(today.getHours() + 9);
    today.toISOString().replace('T', '').substring(0, 19);
    console.log(today.toISOString().replace('T', '').substring(0, 19));
  }, [watchTitle]);

  const getData = () => {
    const date = new Date();
    const year = date.getFullYear().toString();

    let month: DateType = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    let day: DateType = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    let hour: DateType = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    let minites: DateType = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString();

    let seconds: DateType = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    return year + month + day + hour + minites + seconds;
  };

  const onSubmit = async () => {
    setLoading(true);
    const title = getValues().title;
    const content = getValues().content;
    const date = getData();

    try {
      const imageURL = await uploadImageServer(date);
      await setDoc(doc(database, 'posts', 'post' + loginUID + date), {
        UID: loginUID,
        TITLE: title,
        CONTENT: content,
        NICKNAME: loginUserNickName.NICKNAME,
        IMAGE_URL: imageURL,
      });
      navigate(`/post/post${loginUID}${date}`);
    } catch (error) {
      console.log(error);
      alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도하시길 바랍니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return;

    const uploadImageList = event.target.files;
    setUploadImageFile(uploadImageList);

    const uploadImageNameList = uploadImageName.length === 0 ? [] : [...uploadImageName];

    for (let i = 0; i < uploadImageList.length; i++) {
      uploadImageNameList.push(uploadImageList[i].name);
    }

    setUploadImageName(uploadImageNameList);

    const imageURLList = uploadImage.length === 0 ? [] : [...uploadImage];

    for (let i = 0; i < uploadImageList.length; i++) {
      const url = URL.createObjectURL(uploadImageList[i]);
      console.log(typeof url);
      imageURLList.push(url);
    }

    setUploadImage(imageURLList);
  };

  const uploadImageServer = async (date: string) => {
    const storage = getStorage();
    let imageURL = '';

    if (uploadImageFile !== undefined) {
      for (let i = 0; i < uploadImageName.length; i++) {
        const imageRef = `images/${loginUID}${date}/${uploadImageName[i]}`;
        const storageRef = ref(storage, imageRef);
        await uploadBytes(storageRef, uploadImageFile[i]);

        if (i === 0) {
          imageURL = await getDownloadURL(ref(storage, `images/${loginUID}${date}/${uploadImageName[i]}`));
        }
      }
    }

    return imageURL;
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
          <TextareaAutosize
            className="writePostTextArea"
            autoFocus
            rows={1}
            placeholder="내용을 입력하세요."
            id="content"
            {...register('content')}
          />
          {errors.content && <ErrorMessage role="alert">{errors.content.message}</ErrorMessage>}
          <ButtonSection>
            <Button
              color="var(--blue-sky-color-1)"
              type="submit"
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
  margin-top: 2rem;
  margin-bottom: 1rem;
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
  margin-top: 2rem;
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
