import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { signInWithGoogle } from "./auth";
import { getFirebase } from "./firebase";
import CanvasNetwork from "./components/CanvasNetwork";
import OnboardingOverlay from "./components/OnboardingOverlay";
import SectionNav from "./components/SectionNav";
import AgentCard from "./components/AgentCard";
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

  const defaultAgents = [
    { id: "core", x: 100, y: 120 },
    { id: "mentor", x: 250, y: 60 },
    { id: "opportunity", x: 400, y: 200 }
  ];
  const [agents, setAgents] = useState(
    defaultAgents.map(a => ({ ...a, activity: 0, connections: 0 }))
  );
  const [registry, setRegistry] = useState([]);

  useEffect(() => {
    fetch('/config/agents.json')
      .then(res => res.json())
      .then(data => setRegistry(Object.values(data)))
      .catch(err => console.error('failed to load agents', err));
  }, []);

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
    getFirebase().then(({ app }) => {
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
    });
    return () => unsub && unsub();
  }, []);

  const triggerPulse = id => {
    canvasRef.current?.updateActivity(id);
  };

  const trainAgent = async id => {
    try {
      const { app } = await getFirebase();
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
              anomalyScore={live.anomalyScore}
              onTrain={() => trainAgent(reg.name)}
            />
          );
        })}
      </div>

      <button onClick={() => triggerPulse("core")}>Trigger Core Pulse</button>
      <CanvasNetwork ref={canvasRef} agents={agents} width={500} height={300} />
    </div>
    </DashboardDataProvider>
  );
}

export default App;
