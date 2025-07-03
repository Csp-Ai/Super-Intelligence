import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { app, auth } from '../firebase';

function normalize(events) {
  return events
    .filter(e => e.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export default function AgentTimelinePanel({ onSelectAgent }) {
  const [events, setEvents] = useState([]);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore(app);
        const all = [];

        const anomaliesQ = query(collection(db, 'anomalies'), orderBy('timestamp', 'desc'), limit(20));
        const anomaliesSnap = await getDocs(anomaliesQ);
        anomaliesSnap.forEach(doc => {
          const d = doc.data();
          all.push({
            agentId: d.agent,
            eventType: 'anomaly',
            timestamp: d.timestamp,
            summary: d.type
          });
        });

        const syncQ = query(collection(db, 'agentSyncLogs'), orderBy('timestamp', 'desc'), limit(20));
        const syncSnap = await getDocs(syncQ);
        syncSnap.forEach(doc => {
          const d = doc.data();
          all.push({
            agentId: d.sourceAgent,
            eventType: 'sync',
            timestamp: d.timestamp,
            summary: `${d.sourceAgent} → ${d.targetAgent}: ${d.strategySummary}`
          });
        });

        const uid = auth.currentUser?.uid;
        if (uid) {
          const resumeQ = query(collection(db, 'users', uid, 'resume'), orderBy('timestamp', 'desc'), limit(5));
          const resumeSnap = await getDocs(resumeQ);
          resumeSnap.forEach(doc => {
            const d = doc.data();
            all.push({
              agentId: 'resume-agent',
              eventType: 'resume',
              timestamp: d.timestamp,
              summary: (d.summary || '').slice(0, 80)
            });
          });

          const roadmapQ = query(collection(db, 'users', uid, 'roadmap'), orderBy('timestamp', 'desc'), limit(5));
          const roadmapSnap = await getDocs(roadmapQ);
          roadmapSnap.forEach(doc => {
            const d = doc.data();
            if (Array.isArray(d.roadmap)) {
              d.roadmap.forEach(step => {
                all.push({
                  agentId: 'roadmap-agent',
                  eventType: 'roadmap',
                  timestamp: d.timestamp,
                  summary: `${step.phase}: ${step.description}`
                });
              });
            }
          });
        }

        setEvents(normalize(all));
      } catch (err) {
        console.error('Failed to fetch timeline data', err);
      }
    };

    fetchData();
  }, []);

  const types = Array.from(new Set(events.map(e => e.eventType)));
  const filtered = events.filter(e => {
    if (filterAgent && e.agentId !== filterAgent) return false;
    if (filterType !== 'all' && e.eventType !== filterType) return false;
    return true;
  });

  return (
    <div className="bg-white/10 backdrop-blur p-3 rounded shadow mb-4 max-h-80 overflow-y-auto">
      <h4 className="font-semibold mb-2">Agent Activity Timeline</h4>
      <div className="flex space-x-2 mb-2 text-sm">
        <input
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          placeholder="Filter by agent"
          className="border bg-transparent px-2 py-1 rounded flex-1"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border bg-transparent px-2 py-1 rounded"
        >
          <option value="all">All</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <ul className="space-y-2">
        <AnimatePresence>
          {filtered.map((evt, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectAgent && onSelectAgent(evt.agentId)}
              className="cursor-pointer"
            >
              <div className="flex justify-between">
                <span className="font-medium capitalize">{evt.agentId}</span>
                <span className="text-xs text-gray-400">{evt.eventType}</span>
              </div>
              <p className="text-sm">{evt.summary}</p>
              <p className="text-xs text-gray-400">
                {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : ''}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <li className="text-sm">No events found.</li>}
      </ul>
    </div>
  );
}
