import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';

const LikeListPage = () => {
  const menu = ['editUserInfo', 'likeList', 'editPassword'];

  return (
    <>
      <Header />
      <Tab menu={menu} />
      <Footer />
    </>
  );
};

export default LikeListPage;
