import styled from '@emotion/styled';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';

const MyPage = () => {
  const menu = ['editUserInfo', 'likeList'];

  return (
    <>
      <Header />
      <Tab menu={menu} />
      <Section />
      <Footer />
    </>
  );
};

const Section = styled.div`
  min-height: calc(100vh - 10rem - 3.2rem - 1.85rem);
`;

export default MyPage;
