import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, provider);
};
