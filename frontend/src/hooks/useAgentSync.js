import { useEffect, useState } from 'react';
import { auth, app } from '../firebase';

export default function useAgentSync(runId) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!runId) return;
    let source;
    let isMounted = true;

    const connect = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const url = `https://us-central1-${app.options.projectId}.cloudfunctions.net/agentSyncSubscribe?runId=${runId}&token=${token}`;
        source = new EventSource(url);
        source.onmessage = evt => {
          try {
            const data = JSON.parse(evt.data);
            if (isMounted) {
              setEvents(prev => [data, ...prev].slice(0, 20));
            }
          } catch (err) {
            console.error('Invalid AgentSync payload', err);
          }
        };
        source.onerror = () => {
          if (source) source.close();
          setTimeout(connect, 1000);
        };
      } catch (err) {
        console.error('AgentSync subscribe failed', err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (source) source.close();
    };
  }, [runId]);

  return events;
}
