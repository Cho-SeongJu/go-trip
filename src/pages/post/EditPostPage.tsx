import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { doc, setDoc } from 'firebase/firestore/lite';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import UploadCarousel from '../../components/carousel/UploadCarousel';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';
import Header from '../../components/header/Header';
import { uid, userInfo } from '../../store/data';
import { postDetailData } from '../../store/postDetail';
import { getExpireTime } from '../../store/date';
import { useCookies } from 'react-cookie';

interface PostFormType {
  title: string;
  content: string;
}

const EditPostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<string[]>([]);
  const [uploadImageName, setUploadImageName] = useState<string[]>([]);
  const [uploadImageFile, setUploadImageFile] = useState<File[]>([]);
  const [uploadImageType, setUploadImageType] = useState<string[]>([]);
  const [propsImageURLList, setPropsImageURLList] = useState<string[]>([]);
  const [, setCookie] = useCookies(['uid']);
  const loginUID = useRecoilValue(uid);
  const loginUserNickName = useRecoilValue(userInfo);
  const postData = useRecoilValue(postDetailData);
  const { postID } = useParams();
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
  }, [watchTitle]);

  useEffect(() => {
    setUploadImage(postData.IMAGE_URL_LIST);
    setTitleLength(postData.TITLE.length);
    setUploadImageName(postData.IMAGE_NAME_LIST);
    setPropsImageURLList(postData.IMAGE_URL_LIST);
    setUploadImageType(postData.IMAGE_TYPE_LIST);
  }, []);

  const createFile = async () => {
    const fileList: File[] = [];

    for (let i = 0; i < propsImageURLList.length; i++) {
      const response = await fetch(propsImageURLList[i]);
      const data = await response.blob();
      console.log(data);
      const metadata = {
        type: uploadImageType[i],
      };
      const imageName = uploadImageName[i];

      const file = new File([data], imageName, metadata);
      fileList.push(file);
    }

    setUploadImageFile(fileList);
  };

  useEffect(() => {
    createFile();
  }, [uploadImageType]);

  useEffect(() => {
    console.log(uploadImageFile);
  }, [uploadImageFile]);

  const onSubmit = async () => {
    setLoading(true);
    const title = getValues().title;
    const content = getValues().content;

    try {
      const imageURLList = await uploadImageServer();
      console.log(postID);
      await setDoc(doc(database, 'posts', String(postID)), {
        UID: loginUID,
        TITLE: title,
        CONTENT: content,
        NICKNAME: loginUserNickName.NICKNAME,
        THUMBNAIL_IMAGE_URL: imageURLList[0],
        IMAGE_URL_LIST: imageURLList,
      });
      navigate(`/post/${postID}`);
    } catch (error) {
      console.log(error);
      alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도하시길 바랍니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return;

    const uploadImageList = uploadImageFile.length === 0 ? Array.from(event.target.files) : [...uploadImageFile, ...Array.from(event.target.files)];
    console.log(uploadImageList);
    setUploadImageFile(uploadImageList);

    const uploadImageNameList = uploadImageName.length === 0 ? [] : [...uploadImageName];

    const nowUploadImageList = event.target.files;

    for (let i = 0; i < nowUploadImageList.length; i++) {
      uploadImageNameList.push(nowUploadImageList[i].name);
    }
    console.log(uploadImageNameList);
    setUploadImageName(uploadImageNameList);

    const imageURLList = uploadImage.length === 0 ? [] : [...uploadImage];

    for (let i = 0; i < nowUploadImageList.length; i++) {
      const url = URL.createObjectURL(nowUploadImageList[i]);
      imageURLList.push(url);
    }
    console.log(imageURLList);

    setUploadImage(imageURLList);
  };

  const uploadImageServer = async () => {
    const storage = getStorage();
    const imageURLList: string[] = [];

    if (uploadImageFile !== undefined) {
      console.log(uploadImageFile);
      for (let i = 0; i < uploadImageName.length; i++) {
        const imageRef = `images/${String(postID)}/${uploadImageName[i]}`;
        const storageRef = ref(storage, imageRef);
        console.log(uploadImageFile[i]);
        await uploadBytes(storageRef, uploadImageFile[i]);
        const imageURL = await getDownloadURL(ref(storage, `images/${String(postID)}/${uploadImageName[i]}`));
        console.log(imageURL);
        imageURLList.push(imageURL);
      }
    }

    return imageURLList;
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', loginUID, { path: '/', expires: expireTime });
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
              defaultValue={postData.TITLE}
            />
            <TitleLength>{titleLength} / 80</TitleLength>
          </TitleSection>
          {errors.title && <ErrorMessage role="alert">{errors.title.message}</ErrorMessage>}
          <ImageSection>
            <UploadCarousel
              upload={uploadImage}
              className="upload"
            />
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
            defaultValue={postData.CONTENT}
            {...register('content')}
          />
          {errors.content && <ErrorMessage role="alert">{errors.content.message}</ErrorMessage>}
          <ButtonSection>
            <Button
              onClick={setCookieHandle}
              color="var(--blue-sky-color-1)"
              type="submit"
            >
              수정
            </Button>
            <Button
              onClick={setCookieHandle}
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

export default EditPostPage;
