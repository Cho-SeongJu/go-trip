import styled from '@emotion/styled';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Test = () => {
  return (
    <>
      <Carousel
        showArrows={true}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
      >
        <></>
        <Section>
          <img
            src="../../public/logo.png"
            alt=""
          />
        </Section>
      </Carousel>
    </>
  );
};

const Section = styled.div`
  width: 100vw;
`;

export default Test;
