import { doc, getDoc } from 'firebase/firestore/lite';
import { Cookies } from 'react-cookie';
import { atom } from 'recoil';
import { database } from '../../firebase';
import { UIDType } from '../type/type';

interface UserInfoType {
  NICKNAME: string;
}

const cookies = new Cookies();
export const COOKIE_KEY = 'uid';

const filterUID: UIDType = cookies.get(COOKIE_KEY) === undefined ? 'anonymous' : cookies.get(COOKIE_KEY);

export const uid = atom({
  key: 'uid',
  default: filterUID,
});

const getUserInfo = async () => {
  const docRef = doc(database, 'users', filterUID);
  const docSnap = await getDoc(docRef);
  const docData = docSnap.data() as UserInfoType;
  return docData;
};

export const userInfo = atom({
  key: 'userInfo',
  default: filterUID !== 'anonymous' ? getUserInfo() : { NICKNAME: 'anonymous' },
});
