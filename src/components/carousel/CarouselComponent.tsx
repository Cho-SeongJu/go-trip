import styled from '@emotion/styled';
import { Carousel } from 'react-responsive-carousel';

interface PropsType {
  imageList: string[];
  className: string;
  height: string;
}

interface UploadImgPropsType {
  height: string;
}

const CarouselComponent = (props: PropsType) => {
  return (
    <Carousel
      className={props.className}
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
            height={props.height}
          />
        </SlideSection>
      ))}
    </Carousel>
  );
};

const SlideSection = styled.div`
  overflow: hidden;
`;

const UploadImage = styled.img<UploadImgPropsType>`
  width: var(--common-post-width);
  height: ${(props) => props.height};
  object-fit: contain;
  border-radius: 0.3rem;
`;

export default CarouselComponent;
