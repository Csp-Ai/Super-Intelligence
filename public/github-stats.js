async function updateStarCount() {
  try {
    const resp = await fetch('https://api.github.com/repos/Csp-Ai/Super-Intelligence');
    const data = await resp.json();
    const stars = data.stargazers_count;
    const footerLink = document.getElementById('githubStar');
    if (footerLink) {
      footerLink.innerHTML = `Star us on GitHub ⭐ ${stars}`;
    }
    const widget = document.getElementById('githubStars');
    if (widget) {
      widget.textContent = `⭐ Stars: ${stars}`;
    }
  } catch (err) {
    console.error('Failed to fetch GitHub stats', err);
  }
}

async function updateRecentCommit() {
  try {
    const resp = await fetch('https://api.github.com/repos/Csp-Ai/Super-Intelligence/commits?per_page=1');
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      const commit = data[0];
      const msg = commit.commit.message.split('\n')[0];
      const date = commit.commit.author.date.substring(0, 10);
      const el = document.getElementById('githubCommit');
      if (el) {
        el.textContent = `Last commit: ${msg} (${date})`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch recent commit', err);
  }
}

updateStarCount();
updateRecentCommit();
