import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { doc, setDoc } from 'firebase/firestore/lite';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import UploadCarousel from '../../components/carousel/UploadCarousel';
import ErrorMessage from '../../components/errorMessage/ErrorMesage';
import Header from '../../components/header/Header';
import { uid, userInfo } from '../../store/data';
import { getDate, getExpireTime } from '../../store/date';
import { useCookies } from 'react-cookie';

interface PostFormType {
  title: string;
  content: string;
}

const WritePostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<string[]>([]);
  const [uploadImageName, setUploadImageName] = useState<string[]>([]);
  const [uploadImageFile, setUploadImageFile] = useState<File[]>([]);
  // const [uploadImageType, setUploadImageType] = useState<string[]>([]);
  // const [uploadImageSize, setUploadImageSize] = useState<number[]>([]);
  const [, setCookie] = useCookies(['uid']);
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
  }, [watchTitle]);

  const onSubmit = async () => {
    setLoading(true);
    const title = getValues().title;
    const content = getValues().content;
    const date = getDate();

    try {
      const imageURLList = await uploadImageServer(date);

      await setDoc(doc(database, 'posts', 'post' + loginUID + date), {
        UID: loginUID,
        TITLE: title,
        CONTENT: content,
        NICKNAME: loginUserNickName.NICKNAME,
        THUMBNAIL_IMAGE_URL: imageURLList[0],
        IMAGE_URL_LIST: imageURLList,
        IMAGE_NAME_LIST: uploadImageName,
        // IMAGE_TYPE_LIST: uploadImageType,
        // IMAGE_SIZE_LIST: uploadImageSize,
        CREATED_AT: getDate(),
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

    const uploadImageList = Array.from(event.target.files);
    console.log(uploadImageList);

    setUploadImageFile(uploadImageList);

    const uploadImageNameList = uploadImageName.length === 0 ? [] : [...uploadImageName];
    // const uploadImageTypeList = uploadImageType.length === 0 ? [] : [...uploadImageType];
    // const uploadImageSizeList = uploadImageSize.length === 0 ? [] : [...uploadImageSize];

    for (let i = 0; i < uploadImageList.length; i++) {
      uploadImageNameList.push(uploadImageList[i].name);
      // uploadImageTypeList.push(uploadImageList[i].type);
      // uploadImageSizeList.push(uploadImageList[i].size);
    }

    setUploadImageName(uploadImageNameList);
    // setUploadImageType(uploadImageTypeList);
    // setUploadImageSize(uploadImageSizeList);

    const imageURLList = uploadImage.length === 0 ? [] : [...uploadImage];

    for (let i = 0; i < uploadImageList.length; i++) {
      const url = URL.createObjectURL(uploadImageList[i]);
      imageURLList.push(url);
    }

    setUploadImage(imageURLList);
  };

  const uploadImageServer = async (date: string) => {
    const storage = getStorage();
    const imageURLList: string[] = [];

    if (uploadImageFile !== undefined) {
      for (let i = 0; i < uploadImageName.length; i++) {
        const imageRef = `images/posts/post${loginUID}${date}/content/${uploadImageName[i]}`;
        const storageRef = ref(storage, imageRef);
        console.log(uploadImageFile[i]);
        await uploadBytes(storageRef, uploadImageFile[i]);
        const imageURL = await getDownloadURL(ref(storage, `images/posts/post${loginUID}${date}/content/${uploadImageName[i]}`));
        imageURLList.push(imageURL);
      }
    }

    return imageURLList;
  };

  const DeleteImageHandle = (index: number) => {
    const imageNameList = uploadImageName.map((element) => {
      return element;
    });

    const imageURL = uploadImage.map((element) => {
      return element;
    });
    // const imageType = uploadImageType.map((element) => {
    //   return element;
    // });

    const imageFile = uploadImageFile.map((element) => {
      return element;
    });

    if (index === 0 && imageFile !== undefined) {
      console.log('asd');
      imageNameList.shift();
      imageFile.shift();
      imageURL.shift();
      // imageType.shift();
      setUploadImageName(imageNameList);
      setUploadImageFile(imageFile);
      setUploadImage(imageURL);
      // setUploadImageType(imageType);
    } else if (index === imageNameList.length - 1) {
      imageNameList.pop();
      imageFile.pop();
      imageURL.pop();
      // imageType.pop();
      setUploadImageName(imageNameList);
      setUploadImageFile(imageFile);
      setUploadImage(imageURL);
      // setUploadImageType(imageType);
    } else {
      imageNameList.splice(index, 1);
      imageFile.splice(index, 1);
      imageURL.splice(index, 1);
      // imageType.splice(index, 1);
      setUploadImageName(imageNameList);
      setUploadImageFile(imageFile);
      setUploadImage(imageURL);
      // setUploadImageType(imageType);
    }
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
                  accept=".jpg, .png, .jpeg"
                />
              </ImageUploadLabel>
              <ImageList>
                {uploadImageName.map((image, index) => (
                  <Item key={`${image}${index}`}>
                    <ImageName>{image}</ImageName>
                    <BtnImageDelete
                      type="button"
                      onClick={() => DeleteImageHandle(index)}
                    >
                      X
                    </BtnImageDelete>
                  </Item>
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
              onClick={setCookieHandle}
              color="var(--blue-sky-color-1)"
              type="submit"
            >
              저장
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

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-color-1);
`;

const BtnImageDelete = styled.button`
  border: none;
  background-color: var(--white-color-1);
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  border-radius: 0.2rem;
  &: hover {
    background-color: var(--gray-color-2);
  }
`;

const ImageName = styled.p`
  padding: 0.6rem 0.5rem;
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
