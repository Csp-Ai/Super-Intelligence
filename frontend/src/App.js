import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { signInWithGoogle } from "./auth";

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
  const [activeSection, setActiveSection] = useState("home");
  const reduceMotion = useReducedMotion();

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
    </div>
  );
}
export default App;

