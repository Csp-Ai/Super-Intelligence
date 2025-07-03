# 🎬 Opening Line

Welcome to the Super-Intelligence demo. Let’s start by logging in as a test user and watch our agents come alive.

# 🧪 Feature Walkthrough

1. **NeuroCosmicInterface**
   - Navigate to the React app.
   - "This animation shows the real-time pulse of agents currently deployed."
   - Point to the `<CanvasNetwork />` visualizer with animated nodes pulsing as agent activity updates.

2. **Agent Onboarding**
   - From the landing page, sign up with email or Google.
   - Demonstrate the onboarding overlay from `OnboardingOverlay.js` guiding new users with tooltips and modals.
   - "Each step explains what the agent network does and how to explore your data."

3. **Dashboard Filtering**
   - Open `dashboard.html`.
   - Use the user ID input to filter by agent, status, tags, and time.
   - Show how roadmap, resume and opportunity results load for the selected run.

4. **Feedback UI**
   - Click on a run entry to open the modal.
   - Submit a rating and comment via the feedback section (`user-dashboard.html`).
   - Highlight how `logger.js` records feedback into Firestore.

5. **Firestore Data Flow**
   - In the Firebase Console, browse `users/{uid}/agentRuns` and `logs` collections.
   - Explain how `onCreateUser.js` triggers the onboarding flow that stores roadmap, resume and opportunity data per user.

6. **CI/CD & Agent Validation**
   - Show the GitHub Actions workflow badge in `README.md`.
   - "Every commit runs `npm test --silent` to validate agents and sync metadata." 
   - Mention `DeploySteps` component listing install and test steps for developers.

# 🛠️ Behind-the-Scenes (Dev Console / Firebase)

- Open `devops.html` to display agent lifecycle metrics, recent anomalies and CI coverage, all powered by Firestore queries and `anomalyAgent` logs.
- Show terminal output of `firebase deploy` or emulator logs demonstrating live Functions execution.
- Mention `agentSyncSubscribe` for real-time Server-Sent Events streaming agent run updates.

# 🚀 Vision & Close

"This is more than a dashboard — it’s a glimpse at governed, explainable AI systems anyone can build." 

Thank the audience and invite them to explore the repo or deploy their own instance via Firebase Hosting.
