import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebase } from './firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const { auth } = await getFirebase();
  return signInWithPopup(auth, provider);
};
