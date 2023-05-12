import styled from '@emotion/styled';
import { Carousel } from 'react-responsive-carousel';

interface PropsType {
  imageList: string[];
}

const CarouselComponent = (props: PropsType) => {
  return (
    <Carousel
      showThumbs={false}
      showArrows={true}
      infiniteLoop={true}
      showStatus={false}
      // autoPlay={true}
    >
      {props.imageList?.map((image, index) => (
        <SlideSection key={index}>
          <UploadImage
            src={image}
            alt="carousel-image"
          />
        </SlideSection>
      ))}
    </Carousel>
  );
};

const SlideSection = styled.div`
  width: 30rem;
  height: 20rem;
  overflow: hidden;
  border: 1px solid black;
`;

const UploadImage = styled.img`
  object-fit: contain;
`;

export default CarouselComponent;
