import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { doc, updateDoc } from 'firebase/firestore/lite';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ChangeEvent, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
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
import { uid } from '../../store/data';
import { getExpireTime } from '../../store/date';
import { postDetailData } from '../../store/postDetail';

interface PostFormType {
  title: string;
  content: string;
}

const EditPostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<string[]>([]);
  const [uploadImageName, setUploadImageName] = useState<string[]>([]);
  const [uploadImageType, setUploadImageType] = useState<string[]>([]);
  const [newUploadImage, setNewUploadImage] = useState<File[]>([]);
  const [newUploadImageName, setNewUploadImageName] = useState<string[]>([]);
  const [, setCookie] = useCookies(['uid']);
  const loginUID = useRecoilValue(uid);
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

  const onSubmit = async () => {
    setLoading(true);
    const title = getValues().title;
    const content = getValues().content;

    try {
      await uploadImageServer();
      await updateDoc(doc(database, 'posts', String(postID)), {
        TITLE: title,
        CONTENT: content,
        IMAGE_URL_LIST: uploadImage,
        IMAGE_NAME_LIST: uploadImageName,
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

    const newUploadImageList = Array.from(event.target.files);
    setNewUploadImage(newUploadImageList);

    const newUploadImageNameList = [];
    const imageURLList = [...uploadImage];
    const newImageURLList = [];

    for (let i = 0; i < newUploadImageList.length; i++) {
      newUploadImageNameList.push(newUploadImageList[i].name);
      const url = URL.createObjectURL(newUploadImageList[i]);
      imageURLList.push(url);
      newImageURLList.push(url);
    }
    setNewUploadImageName(newUploadImageNameList);

    const uploadImageNameList = uploadImageName.length === 0 ? [] : [...uploadImageName];
    for (let i = 0; i < newUploadImageList.length; i++) {
      uploadImageNameList.push(newUploadImageList[i].name);
    }
    setUploadImageName(uploadImageNameList);

    setUploadImage([...uploadImage, ...newImageURLList]);
  };

  const uploadImageServer = async () => {
    const storage = getStorage();
    const imageURLList: (string | File)[] = [];

    for (let i = 0; i < newUploadImage.length; i++) {
      const imageRef = `images/posts/${String(postID)}/content/${newUploadImageName[i]}`;
      const storageRef = ref(storage, imageRef);
      await uploadBytes(storageRef, newUploadImage[i]);
      const imageURL = await getDownloadURL(ref(storage, `images/posts/${String(postID)}/content/${newUploadImageName[i]}`));
      imageURLList.push(imageURL);
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
    const imageType = uploadImageType.map((element) => {
      return element;
    });

    if (index === 0) {
      imageNameList.shift();
      imageURL.shift();
      imageType.shift();
      setUploadImageName(imageNameList);
      setUploadImage(imageURL);
      setUploadImageType(imageType);
    } else if (index === imageNameList.length - 1) {
      imageNameList.pop();
      imageURL.pop();
      imageType.pop();
      setUploadImageName(imageNameList);
      setUploadImage(imageURL);
      setUploadImageType(imageType);
    } else {
      imageNameList.splice(index, 1);
      imageURL.splice(index, 1);
      imageType.splice(index, 1);
      setUploadImageName(imageNameList);
      setUploadImage(imageURL);
      setUploadImageType(imageType);
    }
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', loginUID, { path: '/', expires: expireTime });
  };

  useEffect(() => {
    if (typeof watchTitle === 'string') {
      setTitleLength(watchTitle.length);
    }
  }, [watchTitle]);

  useEffect(() => {
    setUploadImage(postData.IMAGE_URL_LIST);
    setTitleLength(postData.TITLE.length);
    setUploadImageName(postData.IMAGE_NAME_LIST);
  }, []);

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
  font-size: 0.9rem;
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
