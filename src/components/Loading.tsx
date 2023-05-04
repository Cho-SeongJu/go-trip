import styled from '@emotion/styled';

const Loading = () => {
  return (
    <>
      <LoadingSection>Loading</LoadingSection>
    </>
  );
};

const LoadingSection = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: var(--gray-color-3);
`;

export default Loading;
