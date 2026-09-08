// Base API URL configuration - dynamically uses hosted backend or fallback
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://your-api-domain.onrender.com/api'; // Replace with your backend host domain

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let authToken = localStorage.getItem('token') || null;

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadGames();
});

// -------------------------------------------------------------
// AUTHENTICATION & LOGIN (JWT)
// -------------------------------------------------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Login failed. Check credentials.');
      return;
    }

    // Persist JWT and User state
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    document.getElementById('login-form').reset();
    updateAuthUI();
    switchTab(currentUser.role === 'admin' ? 'admin-page' : 'helper-page');
  } catch (err) {
    console.error('Authentication Error:', err);
    alert('Unable to reach server. Please try again.');
  }
});

function logout() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI();
  switchTab('catalog-page');
}

function updateAuthUI() {
  if (currentUser && authToken) {
    document.querySelectorAll('.auth-only').forEach(el => el.classList.remove('hidden'));
    if (currentUser.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }
    document.querySelectorAll('.helper-only').forEach(el => el.classList.remove('hidden'));
  } else {
    document.querySelectorAll('.auth-only, .admin-only, .helper-only').forEach(el => el.classList.add('hidden'));
  }
}

function switchTab(pageId) {
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(pageId).classList.add('active');

  if (pageId === 'catalog-page') loadGames();
  if (pageId === 'helper-page') loadHelperRequests();
  if (pageId === 'admin-page') loadAdminData();
}

// Helper function to return JWT Authorization Header
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}

// -------------------------------------------------------------
// ADMIN DATA & HELPER MANAGEMENT
// -------------------------------------------------------------
async function loadAdminData() {
  if (!currentUser || currentUser.role !== 'admin') return;

  try {
    const res = await fetch(`${API_URL}/users/helpers`, { headers: getAuthHeaders() });
    const helpers = await res.json();

    const helpersList = document.getElementById('helpers-list');
    if (!helpers.length) {
      helpersList.innerHTML = '<p>No helper accounts created yet.</p>';
      return;
    }

    helpersList.innerHTML = helpers.map(h => `
      <div class="request-item" style="display:flex; justify-content:space-between; align-items:center;">
        <span><strong>${h.username}</strong></span>
        <button class="btn btn-danger" style="width:auto; padding:0.3rem 0.6rem;" onclick="deleteHelper('${h._id}')">Remove</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading admin data:', err);
  }
}

async function deleteHelper(helperId) {
  if (!confirm('Are you sure you want to remove this helper account?')) return;

  const res = await fetch(`${API_URL}/users/helper/${helperId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (res.ok) {
    loadAdminData();
  }
}

// Initialize Catalog
async function loadGames() {
  try {
    const res = await fetch(`${API_URL}/games`);
    const games = await res.json();
    const grid = document.getElementById('game-grid');

    if (!games.length) {
      grid.innerHTML = '<p>No games in the catalog yet.</p>';
      return;
    }

    grid.innerHTML = games.map(game => `
      <div class="card game-card">
        <img src="${game.imageUrl}" alt="${game.title}" />
        <div class="game-card-title">${game.title}</div>
        <p style="font-size:0.85rem; color:#666;">${game.description || ''}</p>
        <div style="margin: 0.5rem 0;">
          <span class="badge badge-${game.status}">${game.status.replace('_', ' ')}</span>
        </div>
        ${game.status === 'available' ? `
          <button class="btn btn-primary" onclick="openCheckoutModal('${game._id}', '${game.title}')">Checkout Game</button>
        ` : `
          <button class="btn btn-primary" disabled>Checked Out</button>
        `}
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading games:', err);
  }
}