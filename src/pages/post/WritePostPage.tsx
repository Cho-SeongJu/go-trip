import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { doc, getDoc, setDoc, where } from 'firebase/firestore/lite';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
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
import { areaArr, areaObj } from '../../store/area';

interface PostFormType {
  title: string;
  content: string;
  detailAddress: string;
}

interface SecondAreaType {
  [key: string]: string[];
}

const WritePostPage = () => {
  const [titleLength, setTitleLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<string[]>([]);
  const [uploadImageName, setUploadImageName] = useState<string[]>([]);
  const [uploadImageFile, setUploadImageFile] = useState<File[]>([]);
  const [mainAreaList, setMainAreaList] = useState<string[]>([]);
  const [secondAreaList, setSecondAreaList] = useState<SecondAreaType>({ 전체: [] });
  const [selectedMainArea, setSelectedMainArea] = useState<string>('전체');
  const [selectedSecondArea, setSelectedSecondArea] = useState<string>('전체');
  const [open, setOpen] = useState<boolean>(false);
  const [secondOpen, setSecondOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [imageErrorMsg, setImageErrorMsg] = useState<string>('');
  const [, setCookie] = useCookies(['uid']);
  const loginUID = useRecoilValue(uid);
  const loginUserNickName = useRecoilValue(userInfo);
  const navigate = useNavigate();

  const formSchema = yup.object({
    title: yup.string().required('제목 입력은 필수입니다.').min(6, '최소 6자 필수 입력입니다.').max(80, '최대 80자까지 입력 가능합니다.'),
    detailAddress: yup.string().required('상세주소 입력은 필수입니다.'),
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
    setMainAreaList(areaArr);
    setSecondAreaList(areaObj);
  }, []);

  useEffect(() => {
    setSelectedSecondArea(secondAreaList[selectedMainArea][0]);
  }, [selectedMainArea]);

  useEffect(() => {
    if (typeof watchTitle === 'string') {
      setTitleLength(watchTitle.length);
    }
  }, [watchTitle]);

  const check = (imageURLList: string[]) => {
    let result = true;
    if (imageURLList.length === 0) {
      setImageErrorMsg('이미지 업로드는 1장 이상 필수입니다.');
      result = false;
    }

    if (selectedMainArea === '전체' || selectedSecondArea === '전체') {
      setErrorMsg('주소를 선택해주세요.');
      result = false;
    } else {
      setErrorMsg('');
    }

    return result;
  };

  const onSubmit = async () => {
    setLoading(true);
    const date = getDate();

    try {
      const imageURLList = await uploadImageServer(date);
      if (!check(imageURLList)) return;

      const title = getValues().title;
      const content = getValues().content;

      const docSnap = await getDoc(doc(database, 'users', String(loginUID)));
      const data = docSnap.data();
      let image = '';
      if (data) image = data.PROFILE_IMAGE;

      await setDoc(doc(database, 'posts', 'post' + loginUID + date), {
        UID: loginUID,
        TITLE: title,
        CONTENT: content,
        NICKNAME: loginUserNickName.NICKNAME,
        THUMBNAIL_IMAGE_URL: imageURLList[0],
        IMAGE_URL_LIST: imageURLList,
        IMAGE_NAME_LIST: uploadImageName,
        MAIN_ADDRESS: selectedMainArea,
        SECOND_ADDRESS: selectedSecondArea,
        DETAIL_ADDRESS: getValues().detailAddress,
        PROFILE_IMAGE: image,
        INQUIRE_COUNT: 0,
        LIKE_COUNT: 0,
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

    setUploadImageFile(uploadImageList);

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
    setImageErrorMsg('');
  };

  const uploadImageServer = async (date: string) => {
    const storage = getStorage();
    const imageURLList: string[] = [];

    if (uploadImageFile !== undefined) {
      for (let i = 0; i < uploadImageName.length; i++) {
        const imageRef = `images/posts/post${loginUID}${date}/content/${uploadImageName[i]}`;
        const storageRef = ref(storage, imageRef);
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

    const imageFile = uploadImageFile.map((element) => {
      return element;
    });

    if (index === 0 && imageFile !== undefined) {
      imageNameList.shift();
      imageFile.shift();
      imageURL.shift();
      setUploadImageName(imageNameList);
      setUploadImageFile(imageFile);
      setUploadImage(imageURL);
    } else if (index === imageNameList.length - 1) {
      imageNameList.pop();
      imageFile.pop();
      imageURL.pop();
      setUploadImageName(imageNameList);
      setUploadImageFile(imageFile);
      setUploadImage(imageURL);
    } else {
      imageNameList.splice(index, 1);
      imageFile.splice(index, 1);
      imageURL.splice(index, 1);
      setUploadImageName(imageNameList);
      setUploadImageFile(imageFile);
      setUploadImage(imageURL);
    }
  };

  const changeSelectedMainArea = (area: string) => {
    setSelectedMainArea(area);
    setOpen(false);
  };

  const changeSelectedSecondArea = (area: string) => {
    setSelectedSecondArea(area);
    setSecondOpen(false);
  };

  const onClickSelectAreaHandle = (type: string) => {
    if (type === 'main') {
      open ? setOpen(false) : setOpen(true);
      setSecondOpen(false);
      setSelectedSecondArea('');
    } else if (type === 'second') {
      secondOpen ? setSecondOpen(false) : setSecondOpen(true);
      setOpen(false);
    }
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', loginUID, { path: '/', expires: expireTime });
    navigate('/');
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
          {imageErrorMsg.length !== 0 && <ErrorMessage role="alert">{imageErrorMsg}</ErrorMessage>}
          <Label>
            <svg
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              width="23px"
              height="23px"
              viewBox="0 0 930.000000 1280.000000"
              preserveAspectRatio="xMidYMid meet"
            >
              <metadata>Created by potrace 1.15, written by Peter Selinger 2001-2017</metadata>
              <g
                transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                fill="var(--red-color-1)"
                stroke="none"
              >
                <path
                  d="M4335 12789 c-1496 -104 -2843 -915 -3635 -2190 -232 -373 -414 -787
                    -529 -1204 -305 -1107 -197 -2278 305 -3295 191 -387 372 -660 676 -1020 34
                    -41 753 -976 1596 -2077 918 -1199 1555 -2022 1588 -2052 186 -170 442 -170
                    628 0 33 30 670 853 1588 2052 843 1101 1562 2036 1596 2077 304 360 485 633
                    676 1020 566 1147 629 2502 174 3695 -353 923 -967 1689 -1798 2242 -825 549
                    -1864 821 -2865 752z m559 -2254 c224 -29 398 -81 601 -180 553 -268 931 -756
                    1062 -1374 25 -116 27 -145 28 -366 0 -267 -10 -345 -70 -555 -161 -561 -586
                    -1032 -1130 -1253 -201 -82 -365 -120 -592 -139 -294 -25 -593 23 -878 139
                    -544 221 -969 692 -1130 1253 -60 210 -70 288 -70 555 1 221 3 250 28 366 112
                    527 406 965 842 1252 177 116 437 227 637 271 209 46 467 58 672 31z"
                />
              </g>
            </svg>
            <AddressLabel>여행지 주소</AddressLabel>
          </Label>
          <AreaSelectSection>
            <SelectedAreaSection>
              <SelectArea onClick={() => onClickSelectAreaHandle('main')}>{selectedMainArea}</SelectArea>
              {open && (
                <MainAreaList>
                  {mainAreaList.map((area, index) => (
                    <Area
                      key={area + index}
                      onClick={() => changeSelectedMainArea(area)}
                    >
                      {area}
                    </Area>
                  ))}
                </MainAreaList>
              )}
            </SelectedAreaSection>
            <SelectedAreaSection>
              <SecondSelectArea onClick={() => onClickSelectAreaHandle('second')}>{selectedSecondArea ? selectedSecondArea : secondAreaList[selectedMainArea][0]}</SecondSelectArea>
              {secondOpen && (
                <MainAreaList>
                  {secondAreaList[selectedMainArea].map((area, index) => (
                    <Area
                      key={area + index}
                      onClick={() => changeSelectedSecondArea(area)}
                    >
                      {area}
                    </Area>
                  ))}
                </MainAreaList>
              )}
            </SelectedAreaSection>
          </AreaSelectSection>
          <DetailAddressInput
            type="text"
            placeholder="상세주소"
            {...register('detailAddress')}
            // onChange={onChangeDetailAddressHandle}
            // onBlur={checkArea}
          />
          {errors.detailAddress ? <ErrorMessage role="alert">{errors.detailAddress.message}</ErrorMessage> : errorMsg.length !== 0 && <ErrorMessage role="alert">{errorMsg}</ErrorMessage>}
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
  margin-bottom: 6rem;
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
  font-family: 'Noto Sans KR', sans-serif;
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

const Label = styled.label`
  display: flex;
  align-item: center;
  margin-top: 3rem;
  font-weight: 500;
`;

const AddressLabel = styled.div`
  display: flex;
  align-items: center;
`;

const ImageSection = styled.div`
  display: flex;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
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
  background-color: var(--blue-sky-color-1);
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

const AreaSelectSection = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const SelectedAreaSection = styled.div`
  display: flex;
  flex-direction: column;

  &:not(:first-of-type) {
    margin-left: 1rem;
  }
`;

const MainAreaList = styled.div`
  width: 8rem;
  height: 11rem;
  overflow: auto;
  border-left: 1px solid var(--gray-color-2);
  border-right: 1px solid var(--gray-color-2);
  border-bottom: 1px solid var(--gray-color-2);
`;

const SelectArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 8rem;
  height: 2.7rem;
  border: 1px solid var(--gray-color-2);
  border-radius: 0.2rem;
  cursor: pointer;
`;

const SecondSelectArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 8rem;
  height: 2.7rem;
  border: 1px solid var(--gray-color-2);
  border-radius: 0.2rem;
  cursor: pointer;
`;

const Area = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 2.7rem;
  border-bottom: 1px solid var(--gray-color-2);
  font-size: 0.9rem;
  cursor: pointer;

  &: hover {
    background-color: var(--blue-sky-color-1);
    color: var(--white-color-1);
  }
`;

const DetailAddressInput = styled.input`
  font-family: 'Noto Sans KR', sans-serif;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.7rem;
  font-size: 1rem;
  border: 1px solid var(--gray-color-2);
  border-radius: 0.2rem;
  outline: none;
`;

export default WritePostPage;
