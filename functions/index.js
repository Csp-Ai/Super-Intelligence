const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.generateUserPlan = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userId = context.params.userId;

    const roadmap = [
      { phase: "Explore", description: "Research scholarships and internships." },
      { phase: "Build", description: "Craft tailored resume and apply to 3 targets." },
      { phase: "Launch", description: "Submit applications and prep for interviews." },
    ];

    const resume = `Hi, I'm ${userData.fullName}, aiming to achieve ${userData.dreamOutcome}. I bring strengths in leadership, adaptability, and community impact.`;

    const opportunities = [
      { title: "Future Leaders Scholarship", link: "https://example.com" },
      { title: "Tech for Impact Internship", link: "https://example.com" },
      { title: "Equity Accelerator Program", link: "https://example.com" }
    ];

    await db.collection("users").doc(userId).collection("roadmap").add({ roadmap });
    await db.collection("users").doc(userId).collection("resume").add({ resume });
    await db.collection("users").doc(userId).collection("opportunities").add({ opportunities });
  });
