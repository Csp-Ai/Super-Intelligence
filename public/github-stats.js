async function updateStarCount() {
  try {
    const resp = await fetch('https://api.github.com/repos/Csp-Ai/Super-Intelligence');
    const data = await resp.json();
    const stars = data.stargazers_count;
    const el = document.getElementById('githubStar');
    if (el) {
      el.innerHTML = `Star us on GitHub ⭐ ${stars}`;
    }
  } catch (err) {
    console.error('Failed to fetch GitHub stats', err);
  }
}
updateStarCount();
