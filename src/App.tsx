import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import MainPage from './pages/MainPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import SuccessSignUp from './pages/SuccessSignUp.tsx';
import TripPage from './pages/TripPage.tsx';
import EditPostPage from './pages/post/EditPostPage.tsx';
import PostDetailPage from './pages/post/PostDetailPage.tsx';
import WritePostPage from './pages/post/WritePostPage.tsx';
import EditInfoPage from './pages/user/EditInfoPage.tsx';

function App() {
  // const MainPage = lazy(() => import('./pages/MainPage'));
  // const LoginPage = lazy(() => import('./pages/user/LoginPage'));
  // const SignUpPage = lazy(() => import('./pages/user/SignUpPage'));
  // const SuccessSignUp = lazy(() => import('./pages/user/SuccessSignUp'));

  // 이따가 users 추가하고 삭제하는거 진행을 도와줄 state
  // const [users, setUsers] = useState(false);
  // db의 users 컬렉션을 가져옴
  // console.log(database);
  // const usersCollectionRef = collection(database, 'users');

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<MainPage />}
        />
        <Route
          path="/trip"
          element={<TripPage />}
        />
        <Route
          path="/user/login"
          element={<LoginPage />}
        />
        <Route
          path="/user/signUp"
          element={<SignUpPage />}
        />
        <Route
          path="/user/signUp/success"
          element={<SuccessSignUp />}
        />
        <Route
          path="/user/profile/editInfo"
          element={<EditInfoPage />}
        />
        <Route
          path="/writePost"
          element={<WritePostPage />}
        />
        <Route
          path="/post/:postID"
          element={<PostDetailPage />}
        />
        <Route
          path="/post/edit/:postID"
          element={<EditPostPage />}
        />
      </Routes>
    </>
  );
}

export default App;
