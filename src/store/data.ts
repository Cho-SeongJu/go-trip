import { Cookies } from 'react-cookie';
import { atom } from 'recoil';
import { UIDType } from '../type/type';

const cookies = new Cookies();
export const COOKIE_KEY = 'uid';

const filterUID: UIDType = cookies.get(COOKIE_KEY) === undefined ? 'anonymous' : cookies.get(COOKIE_KEY);

export const uid = atom({
  key: 'uid',
  default: filterUID,
});
