import TripContent from '../components/content/Trip/TripContent';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import NavigationBar from '../components/navigationBar/NavigationBar';

const TripPage = () => {
  return (
    <>
      <Header />
      <NavigationBar />
      <TripContent />
      <Footer />
    </>
  );
};

export default TripPage;
