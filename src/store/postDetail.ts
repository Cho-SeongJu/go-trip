import { DocumentData } from 'firebase/firestore/lite';
import { atom } from 'recoil';

const dataObj: DocumentData = {
  CONTENT: '',
  IMAGE_URL_LIST: [],
  IMAGE_NAME_LIST: [],
  NICKNAME: '',
  THUMBNAIL_IMAGE_URL: '',
  TITLE: '',
  UID: '',
  IMAGE_TYPE_LIST: [],
};

export const postDetailData = atom({
  key: 'postDetailData',
  default: dataObj,
});

export const test = ' ';
