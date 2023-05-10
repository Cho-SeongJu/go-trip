import styled from '@emotion/styled';
import { Carousel } from 'react-responsive-carousel';
import { Link } from 'react-router-dom';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../../assets/css/carousel.css';

interface PropsType {
  upload: string[] | null;
}
const ImgCarousel = (props: PropsType) => {
  const uploadImageList = props.upload;

  return (
    <>
      {uploadImageList?.length === 0 ? (
        <CarouselSection>이미지를 업로드 해주세요.</CarouselSection>
      ) : (
        <Carousel
          showThumbs={false}
          showArrows={true}
          infiniteLoop={true}
          showStatus={false}
          // autoPlay={true}
        >
          {uploadImageList?.map((image, index) => (
            <SlideSection key={index}>
              <UploadImage
                src={image}
                alt="carousel-image"
              />
            </SlideSection>
          ))}
        </Carousel>
      )}
    </>
  );
};

const CarouselSection = styled.div`
  width: 30rem;
  height: 20rem;
  border: 1px solid black;
`;

const uploadImgNone = styled.p``;

const SlideSection = styled.div`
  width: 30rem;
  height: 20rem;
  overflow: hidden;
  border: 1px solid black;
`;

const UploadImage = styled.img`
  object-fit: cover;
`;

export default ImgCarousel;
