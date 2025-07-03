import { useRef } from "react";
import { signInWithGoogle } from "./auth";
import CanvasNetwork from "./components/CanvasNetwork";

function App() {
  const canvasRef = useRef(null);
  const agents = [
    { id: "core", x: 100, y: 120 },
    { id: "mentor", x: 250, y: 60 },
    { id: "opportunity", x: 400, y: 200 },
  ];

  const triggerPulse = id => {
    canvasRef.current?.updateActivity(id);
  };

  return (
    <div className="App">
      <h1>🚀 React Frontend Ready - No Binary Assets</h1>
      <button onClick={signInWithGoogle} className="google-btn">
        Sign Up with Google
      </button>
      <button onClick={() => triggerPulse("core")}>Trigger Core Pulse</button>
      <CanvasNetwork ref={canvasRef} agents={agents} width={500} height={300} />
    </div>
  );
}
export default App;

