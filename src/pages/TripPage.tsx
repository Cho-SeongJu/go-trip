import TripContent from '../components/content/Trip/TripContent';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import Tab from '../components/tab/Tab';

const TripPage = () => {
  const menu = ['home', 'trip'];

  return (
    <>
      <Header />
      <Tab menu={menu} />
      <TripContent />
      <Footer />
    </>
  );
};

export default TripPage;
