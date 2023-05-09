import styled from '@emotion/styled';
import { Carousel } from 'react-responsive-carousel';
import { Link } from 'react-router-dom';

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
          // autoPlay={true}
        >
          <CarouselSection>
            {uploadImageList?.map((image, index) => (
              <div key={index}>
                <UploadImage
                  src={image}
                  alt=""
                />
                <p>asd</p>
              </div>
            ))}
          </CarouselSection>
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

const UploadImage = styled.img`
  object-fit: cover;
`;

export default ImgCarousel;
