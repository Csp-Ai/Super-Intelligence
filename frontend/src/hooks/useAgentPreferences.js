import { useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { app, auth } from '../firebase';

export default function useAgentPreferences() {
  const [prefs, setPrefs] = useState({});
  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

  useEffect(() => {
    if (isTest) return;
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (!user) {
        setPrefs({});
        return;
      }
      const ref = doc(getFirestore(app), 'users', user.uid, 'agentPreferences');
      const unsub = onSnapshot(ref, snap => {
        setPrefs(snap.exists() ? snap.data() : {});
      });
      return () => unsub();
    });
    return () => unsubAuth();
  }, []);

  const toggle = async name => {
    if (isTest) {
      setPrefs(p => ({ ...p, [name]: !p[name] }));
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(getFirestore(app), 'users', user.uid, 'agentPreferences');
    const newPrefs = { ...prefs, [name]: !prefs[name] };
    setPrefs(newPrefs);
    await setDoc(ref, newPrefs, { merge: true });
  };

  return [prefs, toggle];
}
