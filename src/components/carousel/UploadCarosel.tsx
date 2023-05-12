import styled from '@emotion/styled';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../../assets/css/carousel.css';
import CarouselComponent from './CarouselComponent';

interface PropsType {
  upload: string[];
}
const ImgCarousel = (props: PropsType) => {
  const uploadImageList = props.upload;

  return (
    <>
      {uploadImageList?.length === 0 ? (
        <CarouselSection>
          <Pharse>이미지 추가 버튼으로</Pharse>
          <Pharse>이미지를 업로드 해주세요.</Pharse>
        </CarouselSection>
      ) : (
        <CarouselComponent imageList={uploadImageList} />
      )}
    </>
  );
};

const CarouselSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 30rem;
  height: 20rem;
  background-color: var(--gray-color-2);
  border-radius: 1%;
`;

const Pharse = styled.p`
  font-size: 1rem;

  &:first-of-type {
    margin-bottom: 0.7rem;
  }
`;

const SlideSection = styled.div`
  width: 30rem;
  height: 20rem;
  overflow: hidden;
  border: 1px solid black;
`;

const UploadImage = styled.img`
  object-fit: contain;
`;

export default ImgCarousel;