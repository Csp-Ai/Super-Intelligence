// Assumes Firebase SDK already initialized in index.html

function submitOpportunityForm() {
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const zipCode = document.getElementById("zipCode").value;
  const currentStanding = document.getElementById("currentStanding").value;
  const dreamOutcome = document.getElementById("dreamOutcome").value;

  firebase.firestore().collection("users").doc(email).set({
    fullName,
    email,
    zipCode,
    currentStanding,
    dreamOutcome,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }).then(() => {
    alert("Form submitted! Your plan is being generated.");
  }).catch((err) => {
    console.error("Error saving form:", err);
  });
}
