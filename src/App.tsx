import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/user/LoginPage';
import SignUpPage from './pages/user/SignUpPage';

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<MainPage />}
        />
        <Route
          path="/user/login"
          element={<LoginPage />}
        />
        <Route
          path="/user/signUp"
          element={<SignUpPage />}
        />
      </Routes>
    </>
  );
}

export default App;
