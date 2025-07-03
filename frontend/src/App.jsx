import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { signInWithGoogle } from "./auth";
import { app } from "./firebase";
import CanvasNetwork from "./components/CanvasNetwork";
import OnboardingOverlay from "./components/OnboardingOverlay";
import SectionNav from "./components/SectionNav";
import AgentCard from "./components/AgentCard";
import AnomalyPanel from "./components/AnomalyPanel";
import TrendsPanel from "./components/TrendsPanel";
import LifecycleTimeline from "./components/LifecycleTimeline";
import { DashboardDataProvider } from "./context/DashboardDataContext";

const sections = {
  home: <p>Welcome to the demo app.</p>,
  about: <p>This is a sample React frontend in this repo.</p>,
  signup: (
    <button onClick={signInWithGoogle} className="google-btn">
      Sign Up with Google
    </button>
  )
};

function App() {
  const canvasRef = useRef(null);
  const [activeSection, setActiveSection] = useState("home");
  const [showOverlay, setShowOverlay] = useState(false);
  const reduceMotion = useReducedMotion();

  const layoutAgents = ids => {
    const centerX = 250;
    const centerY = 150;
    const radius = Math.min(centerX, centerY) - 30;
    return ids.map((id, idx) => {
      const angle = (2 * Math.PI * idx) / ids.length;
      return {
        id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        activity: 0,
        connections: 0,
      };
    });
  };

  const [agents, setAgents] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [showAnomaliesFor, setShowAnomaliesFor] = useState(null);
  const [showLifecycleFor, setShowLifecycleFor] = useState(null);

  useEffect(() => {
    fetch('/config/agents.json')
      .then(res => res.json())
      .then(data => setRegistry(Object.values(data)))
      .catch(err => console.error('failed to load agents', err));
  }, []);

  useEffect(() => {
    if (registry.length) {
      setAgents(layoutAgents(registry.map(r => r.name)));
    }
  }, [registry]);

  useEffect(() => {
    const completed = localStorage.getItem('demoOverlayComplete');
    if (!completed) {
      setShowOverlay(true);
    }
  }, []);

  const handleOverlayDone = () => {
    localStorage.setItem('demoOverlayComplete', '1');
    setShowOverlay(false);
  };

  useEffect(() => {
    let unsub;
    const db = getFirestore(app);
    unsub = onSnapshot(collection(db, 'agents'), snap => {
      const updates = {};
      snap.forEach(doc => {
        updates[doc.id] = doc.data();
      });
      setAgents(prev =>
        prev.map(a => {
          const data = updates[a.id];
          if (!data) return a;
          if (
            data.activity !== a.activity ||
            data.connections !== a.connections
          ) {
            triggerPulse(a.id);
          }
          return { ...a, ...data };
        })
      );
    });
    return () => unsub && unsub();
  }, []);

  const triggerPulse = id => {
    canvasRef.current?.updateActivity(id);
  };

  const trainAgent = async id => {
    try {
      const fn = httpsCallable(getFunctions(app), 'trainAgent');
      await fn({ agentId: id });
    } catch (err) {
      console.error('train failed', err);
    }
  };

  const variants = {
    initial: reduceMotion ? {} : { opacity: 0, x: 20 },
    animate: reduceMotion ? {} : { opacity: 1, x: 0 },
    exit: reduceMotion ? {} : { opacity: 0, x: -20 }
  };

  return (
    <DashboardDataProvider>
      <div className="App">
        {showOverlay && <OnboardingOverlay onComplete={handleOverlayDone} />}
        <h1>🚀 React Frontend Ready - No Binary Assets</h1>

        <SectionNav
          sections={sections}
          active={activeSection}
          onChange={setActiveSection}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="section-container"
          >
            {sections[activeSection]}
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {registry.map(reg => {
            const live = agents.find(a => a.id === reg.name) || {};
            const metrics = {
              activity: live.activity || 0,
              connections: live.connections || 0,
            };
            return (
              <AgentCard
                key={reg.name}
                agentName={reg.name}
                metrics={metrics}
                status={reg.lastRunStatus}
                state={live.currentState}
                anomalyScore={live.anomalyScore}
                onTrain={() => trainAgent(reg.name)}
                onViewAnomalies={() => setShowAnomaliesFor(reg.name)}
                onStatusClick={() => setShowLifecycleFor(reg.name)}
              />
            );
          })}
        </div>

        {showAnomaliesFor && (
          <div>
            <AnomalyPanel agentId={showAnomaliesFor} />
            <button
              onClick={() => setShowAnomaliesFor(null)}
              className="border px-2 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        )}

        {showLifecycleFor && (
          <div className="overlay-backdrop">
            <div className="overlay-panel">
              <LifecycleTimeline agentId={showLifecycleFor} />
              <button
                onClick={() => setShowLifecycleFor(null)}
                className="border px-2 py-1 rounded text-sm mt-2"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <TrendsPanel />

        <button onClick={() => triggerPulse("core")}>Trigger Core Pulse</button>
        <CanvasNetwork ref={canvasRef} agents={agents} width={500} height={300} />
      </div>
    </DashboardDataProvider>
  );
}

export default App;

