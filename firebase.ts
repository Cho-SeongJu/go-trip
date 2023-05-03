// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD7da8xuXXQplE9pOWeD8Cd3ZxCgUaKZSg',
  authDomain: 'gotrip-d562c.firebaseapp.com',
  projectId: 'gotrip-d562c',
  storageBucket: 'gotrip-d562c.appspot.com',
  messagingSenderId: '302203050099',
  appId: '1:302203050099:web:f48476a1565a35fdf67206',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const database = getFirestore(firebaseApp);
