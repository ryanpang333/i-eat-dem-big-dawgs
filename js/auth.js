// ── ACCOUNTS ───────────────────────────────────────────────────────────────
// Simple username + password accounts stored in THIS browser (localStorage).
// NOTE: this is a school-project login, not real security. Passwords are
// hashed (SHA-256) so they aren't saved as plain text, but the data lives in
// the browser — so please don't use a real/important password here.
(function () {
  const USERS_KEY = 'pawfinder_users';
  const SESSION_KEY = 'pawfinder_session';

  async function hash(text) {
    // Preferred: real SHA-256 (needs a secure context like https or localhost).
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for file:// pages where crypto.subtle is unavailable.
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'f' + (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }
  function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  const Auth = {
    currentUser() { return localStorage.getItem(SESSION_KEY) || null; },

    async signUp(username, password) {
      username = (username || '').trim();
      password = password || '';
      if (username.length < 3) throw new Error('Username must be at least 3 characters.');
      if (password.length < 8 || password.length > 32) throw new Error('Password must be 8–32 characters long.');
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) throw new Error('Password must include both letters and numbers.');
      const users = getUsers();
      if (users[username.toLowerCase()]) throw new Error('That username is already taken.');
      users[username.toLowerCase()] = { username, pass: await hash(password), created: Date.now() };
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, username); // sign in right away
      return true;
    },

    async logIn(username, password) {
      username = (username || '').trim();
      const rec = getUsers()[username.toLowerCase()];
      if (!rec) throw new Error('No account found with that username.');
      if (rec.pass !== await hash(password)) throw new Error('Incorrect password.');
      localStorage.setItem(SESSION_KEY, rec.username);
      return true;
    },

    logOut() { localStorage.removeItem(SESSION_KEY); location.href = 'login.html'; },
  };
  window.pawfinderAuth = Auth;

  const onLoginPage = /login\.html$/i.test(location.pathname) ||
    (document.body && document.body.dataset.page === 'login');

  // Gate every normal page: no account = go to the login screen.
  if (!onLoginPage && !Auth.currentUser()) {
    location.replace('login.html');
    return;
  }

  // Show a "👤 username (log out)" chip in the nav once signed in.
  if (!onLoginPage) {
    document.addEventListener('DOMContentLoaded', () => {
      const nav = document.querySelector('nav');
      const user = Auth.currentUser();
      if (!nav || !user) return;
      const chip = document.createElement('button');
      chip.className = 'dark-toggle user-chip';
      chip.textContent = '👤 ' + user;
      chip.title = 'Click to log out';
      chip.onclick = () => { if (confirm('Log out of "' + user + '"?')) Auth.logOut(); };
      nav.appendChild(chip);
    });
  }
})();
