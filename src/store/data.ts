import { atom } from 'recoil';
import { useCookies } from 'react-cookie';
import { auth } from '../../firebase';

type UserAuthType = string | null;

const initialUserAuth: UserAuthType = auth.currentUser === null ? 'anonymous' : auth.currentUser.uid;

export const userAuth = atom({
  key: 'userAuth',
  default: initialUserAuth,
});

export const CheckAuth = () => {
  const [cookies, setCookies, removeCookie] = useCookies(['id']);
  const token = cookies.id;

  console.log(token);
};
