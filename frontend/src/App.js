import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { signInWithGoogle } from "./auth";
import CanvasNetwork from "./components/CanvasNetwork";

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
  const reduceMotion = useReducedMotion();

  const agents = [
    { id: "core", x: 100, y: 120 },
    { id: "mentor", x: 250, y: 60 },
    { id: "opportunity", x: 400, y: 200 }
  ];

  const triggerPulse = id => {
    canvasRef.current?.updateActivity(id);
  };

  const variants = {
    initial: reduceMotion ? {} : { opacity: 0, x: 20 },
    animate: reduceMotion ? {} : { opacity: 1, x: 0 },
    exit: reduceMotion ? {} : { opacity: 0, x: -20 }
  };

  return (
    <div className="App">
      <h1>🚀 React Frontend Ready - No Binary Assets</h1>

      <nav className="space-x-2 mb-4">
        {Object.keys(sections).map(key => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className="border px-2 py-1 rounded"
          >
            {key}
          </button>
        ))}
      </nav>

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

      <button onClick={() => triggerPulse("core")}>Trigger Core Pulse</button>
      <CanvasNetwork ref={canvasRef} agents={agents} width={500} height={300} />
    </div>
  );
}

export default App;
