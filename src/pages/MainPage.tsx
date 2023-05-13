import Content from '../components/content/Content';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import Tab from '../components/tab/Tab';

const MainPage = () => {
  const menu = ['home', 'trip'];

  return (
    <>
      <Header />
      <Tab menu={menu} />
      <Content />
      <Footer />
    </>
  );
};

export default MainPage;
