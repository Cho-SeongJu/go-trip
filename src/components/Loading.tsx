import styled from '@emotion/styled';
import { PulseLoader } from 'react-spinners';

interface PropsType {
  display: string;
}

const Loading = (props: PropsType) => {
  return (
    <>
      <LoadingSection display={props.display}>
        <PulseLoader
          size={20}
          color="#36d7b7"
          speedMultiplier={1}
          loading
          margin={2}
        />
      </LoadingSection>
    </>
  );
};

const LoadingSection = styled.div<{ display: string }>`
  display: ${(props) => props.display};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background-color: var(--loading-backgroun-color);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Loading;
