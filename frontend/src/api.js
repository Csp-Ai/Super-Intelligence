import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';

export async function callAgentAPI(data) {
  const user = auth.currentUser;
  const token = user ? await getIdToken(user) : null;

  const res = await fetch('/agent-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });

  return res.json();
}
