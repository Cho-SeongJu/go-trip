import { atom } from 'recoil';
import { useCookies } from 'react-cookie';
import { auth } from '../../firebase';

interface UserAuthType {
  userAuth: string | null;
}

const initialUserAuth: UserAuthType = {
  userAuth: auth.currentUser === null ? 'noLogin' : auth.currentUser.uid,
};

export const userAuth = atom({
  key: 'userAuth',
  default: initialUserAuth,
});

export const CheckAuth = () => {
  const [cookies, setCookies, removeCookie] = useCookies(['id']);
  const token = cookies.id;

  console.log(token);
};
