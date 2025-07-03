import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingOverlay({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    (
      <div>
        <p className="mb-2">
          Welcome! Explore our agent logs via{' '}
          <a href="/sample-data.json" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">sample data</a>.
        </p>
      </div>
    ),
    (
      <div>
        <p className="mb-2">
          Learn more about this project in the{' '}
          <a href="/README.md" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">README</a>.
        </p>
      </div>
    )
  ];

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="overlay-backdrop"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="overlay-panel"
        >
          {steps[step]}
          <button onClick={next} className="border px-3 py-1 rounded mt-4">
            {step < steps.length - 1 ? 'Next' : 'Done'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
