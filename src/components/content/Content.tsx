import styled from '@emotion/styled';

const Content = () => {
  return (
    <>
      <ContentSection></ContentSection>
    </>
  );
};

const ContentSection = styled.section`
  margin: var(--common-margin);
  max-width: var(--common-width);
  height: 100vh;
`;

export default Content;
