import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/user/LoginPage';
import SignUpPage from './pages/user/SignUpPage';
import { useEffect, useState } from 'react';
import { database, auth } from '../firebase.ts';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore/lite';

function App() {
  // 이따가 users 추가하고 삭제하는거 진행을 도와줄 state
  const [users, setUsers] = useState([]);
  // db의 users 컬렉션을 가져옴
  console.log(database);
  const usersCollectionRef = collection(database, 'users');

  // 시작될때 한번만 실행
  useEffect(() => {
    console.log(auth);
    // 비동기로 데이터 받을준비
    const getUsers = async () => {
      // getDocs로 컬렉션안에 데이터 가져오기
      const data = await getDocs(usersCollectionRef);
      console.log(data);
    };

    getUsers();
  }, []);

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
