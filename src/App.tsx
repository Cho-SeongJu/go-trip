import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import SuccessSignUp from './pages/SuccessSignUp.tsx';
import TripPage from './pages/TripPage.tsx';
import EditPostPage from './pages/post/EditPostPage.tsx';
import PostDetailPage from './pages/post/PostDetailPage.tsx';
import WritePostPage from './pages/post/WritePostPage.tsx';
import EditInfoPage from './pages/user/EditInfoPage.tsx';
import LikeListPage from './pages/user/LikeListPage.tsx';
import EditPasswordPage from './pages/user/EditPasswordPage.tsx';
import MyPostPage from './pages/user/MyPostPage.tsx';

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
          element={<TripPage />}
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
          path="/user/profile/editUserInfo"
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
        <Route
          path="/user/profile/LikeList"
          element={<LikeListPage />}
        />
        <Route
          path="/user/profile/myPost"
          element={<MyPostPage />}
        />

        <Route
          path="/user/profile/editPassword"
          element={<EditPasswordPage />}
        />
      </Routes>
    </>
  );
}

export default App;
