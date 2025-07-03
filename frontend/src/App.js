import { signInWithGoogle } from "./auth";

function App() {
  return (
    <div className="App">
      <h1>🚀 React Frontend Ready - No Binary Assets</h1>
      <button onClick={signInWithGoogle} className="google-btn">
        Sign Up with Google
      </button>
    </div>
  );
}
export default App;

