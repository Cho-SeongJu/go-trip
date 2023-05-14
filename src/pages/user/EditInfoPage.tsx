import styled from '@emotion/styled';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';

const EditInfoPage = () => {
  const menu = ['editUserInfo', 'likeList'];

  return (
    <>
      <Header />
      <Tab menu={menu} />
      <Section>
        <ProfileImageSection>
          <ProfileImage />
        </ProfileImageSection>
      </Section>
      <Footer />
    </>
  );
};

const Section = styled.div`
  width: var(--common-post-width);

  border: 1px solid black;
  margin: var(--common-margin);
  min-height: calc(100vh - 10rem - 3.2rem - 1.85rem);
`;

const ProfileImageSection = styled.div``;

const ProfileImage = styled.img``;

export default EditInfoPage;
