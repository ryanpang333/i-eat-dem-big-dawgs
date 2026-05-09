// ── AUTH ─────────────────────────────────────────────────────────────────────

function getUser() {
  return JSON.parse(localStorage.getItem('pawfinder_user') || 'null');
}

function saveUser(user) {
  localStorage.setItem('pawfinder_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('pawfinder_user');
  window.location.href = 'index.html';
}

// Called by Google Identity Services after real Google login
function handleGoogleLogin(response) {
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  saveUser({
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    demo: false,
  });
  const returnTo = sessionStorage.getItem('pawfinder_return') || 'index.html';
  sessionStorage.removeItem('pawfinder_return');
  window.location.href = returnTo;
}

// Demo login — simulates a logged-in Google account for class demos
function demoLogin() {
  saveUser({
    name: 'Ryan (Demo)',
    email: 'ryanpang333@gmail.com',
    picture: 'https://ui-avatars.com/api/?name=Ryan&background=ff7043&color=fff&size=64',
    demo: true,
  });
  const returnTo = sessionStorage.getItem('pawfinder_return') || 'index.html';
  sessionStorage.removeItem('pawfinder_return');
  window.location.href = returnTo;
}

// Inject the user avatar + name (or login button) into nav
function updateNavUser() {
  const el = document.getElementById('nav-user');
  if (!el) return;
  const user = getUser();
  if (user) {
    el.innerHTML = `
      <img src="${user.picture}" alt="${user.name}" title="${user.email}">
      <span>${user.name.split(' ')[0]}</span>
      <button class="btn-logout" onclick="logout()">Log out</button>
    `;
  } else {
    el.innerHTML = `<a class="btn-login" href="login.html">Sign in with Google</a>`;
  }
}

// Redirect to login if not signed in; remember where to come back to
function requireLogin() {
  if (!getUser()) {
    sessionStorage.setItem('pawfinder_return', window.location.pathname.split('/').pop());
    window.location.href = 'login.html';
  }
}

// Show a "must be logged in" banner and hide the form
function gateForm(formId, bannerId) {
  const user = getUser();
  const form = document.getElementById(formId);
  const banner = document.getElementById(bannerId);
  if (!form || !banner) return;
  if (!user) {
    form.style.display = 'none';
    banner.style.display = 'block';
  } else {
    // Pre-fill owner / finder name from Google account
    const nameField = form.querySelector('[name="ownerName"], [name="finderName"]');
    if (nameField && !nameField.value) nameField.value = user.name.replace(' (Demo)', '');
  }
}

// ── STORAGE ──────────────────────────────────────────────────────────────────

// Storage helpers
function getPets() {
  return JSON.parse(localStorage.getItem('pawfinder_pets') || '[]');
}

function savePets(pets) {
  localStorage.setItem('pawfinder_pets', JSON.stringify(pets));
}

function getCounter() {
  return parseInt(localStorage.getItem('pawfinder_reunited') || '10');
}

// Convert image file to base64 for storage
function readImageAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Render a single pet card
function renderCard(pet) {
  const imgSrc = pet.photo || 'https://placehold.co/300x150?text=No+Photo';
  return `
    <div class="card">
      <img src="${imgSrc}" alt="${pet.petName}">
      <span class="badge-${pet.type === 'lost' ? 'lost' : 'found'}">${pet.type === 'lost' ? 'LOST' : 'FOUND'}</span>
      <h3>${pet.petName}</h3>
      <p><strong>Animal:</strong> ${pet.animal} ${pet.breed ? '— ' + pet.breed : ''}</p>
      <p><strong>Color:</strong> ${pet.color}</p>
      <p><strong>Size:</strong> ${pet.size}</p>
      <p><strong>${pet.type === 'lost' ? 'Last seen' : 'Found at'}:</strong> ${pet.location}</p>
      <p><strong>Date:</strong> ${pet.date}</p>
      ${pet.special ? `<p><strong>Special features:</strong> ${pet.special}</p>` : ''}
      ${pet.reward === 'yes' ? `<p style="color:#c62828;font-weight:bold;">Reward offered!</p>` : ''}
      <p style="margin-top:8px;"><strong>Contact:</strong> ${pet.ownerName} — ${pet.phone}</p>
      ${pet.lat && pet.lng ? `<a href="map.html" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:#ff7043;">📍 See on map</a>` : ''}
    </div>
  `;
}

// Home page — load recent lost pets
function loadHomePets() {
  const container = document.getElementById('home-pets');
  if (!container) return;
  const pets = getPets().filter(p => p.type === 'lost').slice(-3).reverse();
  if (pets.length === 0) {
    container.innerHTML = '<p class="empty-state">No lost pets posted yet. Be the first!</p>';
    return;
  }
  container.innerHTML = pets.map(renderCard).join('');
}

// Home page — load counter
function loadCounter() {
  const el = document.getElementById('reunited-count');
  if (el) el.textContent = getCounter();
}

// Browse page — load all pets
function loadBrowsePets() {
  const container = document.getElementById('browse-pets');
  if (!container) return;
  const filter = document.getElementById('filter-type');
  const search = document.getElementById('search-input');
  let pets = getPets();

  if (filter && filter.value !== 'all') {
    pets = pets.filter(p => p.type === filter.value);
  }

  if (search && search.value.trim()) {
    const q = search.value.toLowerCase();
    pets = pets.filter(p =>
      p.petName.toLowerCase().includes(q) ||
      p.animal.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }

  pets = pets.reverse();

  if (pets.length === 0) {
    container.innerHTML = '<p class="empty-state">No pets found. Try adjusting your search.</p>';
    return;
  }
  container.innerHTML = pets.map(renderCard).join('');
}

// Location picker — drop a pin on a small map inside the form
function initLocationPicker(mapDivId, latInputId, lngInputId, statusId) {
  const mapDiv = document.getElementById(mapDivId);
  if (!mapDiv) return;

  const pickerMap = L.map(mapDivId).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(pickerMap);

  let marker = null;

  // Try to center on the user's location automatically
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      pickerMap.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }

  pickerMap.on('click', (e) => {
    const { lat, lng } = e.latlng;

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(pickerMap);
    }

    document.getElementById(latInputId).value = lat.toFixed(6);
    document.getElementById(lngInputId).value = lng.toFixed(6);
    document.getElementById(statusId).textContent = `📍 Pin dropped! (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    document.getElementById(statusId).style.color = '#2e7d32';
  });
}

// Submit lost pet form
async function submitLostForm(e) {
  e.preventDefault();
  const form = e.target;
  const photoFile = form.photo.files[0];
  const photoData = photoFile ? await readImageAsBase64(photoFile) : null;

  const lat = parseFloat(form.lat.value) || null;
  const lng = parseFloat(form.lng.value) || null;

  const pet = {
    id: Date.now(),
    type: 'lost',
    ownerName: form.ownerName.value,
    phone: form.phone.value,
    petName: form.petName.value,
    animal: form.animal.value,
    breed: form.breed.value,
    color: form.color.value,
    size: form.size.value,
    photo: photoData,
    location: form.location.value,
    date: form.date.value,
    special: form.special.value,
    reward: form.reward.value,
    lat,
    lng,
  };

  const pets = getPets();
  pets.push(pet);
  savePets(pets);

  form.reset();
  document.getElementById('pin-status-lost').textContent = 'No location selected yet.';
  document.getElementById('pin-status-lost').style.color = '#888';
  document.getElementById('success-lost').style.display = 'block';
  setTimeout(() => document.getElementById('success-lost').style.display = 'none', 4000);
}

// Submit found pet form
async function submitFoundForm(e) {
  e.preventDefault();
  const form = e.target;
  const photoFile = form.photo.files[0];
  const photoData = photoFile ? await readImageAsBase64(photoFile) : null;

  const lat = parseFloat(form.lat.value) || null;
  const lng = parseFloat(form.lng.value) || null;

  const pet = {
    id: Date.now(),
    type: 'found',
    ownerName: form.finderName.value,
    phone: form.phone.value,
    petName: 'Unknown',
    animal: form.animal.value,
    breed: '',
    color: form.color.value,
    size: form.size.value,
    photo: photoData,
    location: form.location.value,
    date: form.date.value,
    special: form.special.value,
    reward: 'no',
    lat,
    lng,
  };

  const pets = getPets();
  pets.push(pet);
  savePets(pets);

  form.reset();
  document.getElementById('pin-status-found').textContent = 'No location selected yet.';
  document.getElementById('pin-status-found').style.color = '#888';
  document.getElementById('success-found').style.display = 'block';
  setTimeout(() => document.getElementById('success-found').style.display = 'none', 4000);
}

// Submit contact form
function submitContactForm(e) {
  e.preventDefault();
  e.target.reset();
  document.getElementById('success-contact').style.display = 'block';
  setTimeout(() => document.getElementById('success-contact').style.display = 'none', 4000);
}

// Main map — show all pets with pins
function initMap() {
  if (!document.getElementById('map')) return;

  const map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const pets = getPets();
  const petsWithLocation = pets.filter(p => p.lat && p.lng);

  if (petsWithLocation.length > 0) {
    const bounds = [];
    petsWithLocation.forEach(pet => {
      bounds.push([pet.lat, pet.lng]);
      const color = pet.type === 'lost' ? '#c62828' : '#2e7d32';
      const imgTag = pet.photo
        ? `<img src="${pet.photo}" style="width:100%;max-height:100px;object-fit:cover;border-radius:6px;margin-bottom:6px;">`
        : '';

      const marker = L.circleMarker([pet.lat, pet.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.85,
        radius: 10,
        weight: 2,
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width:160px;">
          ${imgTag}
          <strong>${pet.petName}</strong>
          <span style="background:${color};color:white;font-size:0.7rem;padding:1px 6px;border-radius:10px;margin-left:6px;">${pet.type.toUpperCase()}</span>
          <br><b>Animal:</b> ${pet.animal}<br>
          <b>Color:</b> ${pet.color}<br>
          <b>Location:</b> ${pet.location}<br>
          <b>Date:</b> ${pet.date}<br>
          <b>Contact:</b> ${pet.ownerName} — ${pet.phone}
          ${pet.reward === 'yes' ? '<br><b style="color:#c62828;">Reward offered!</b>' : ''}
        </div>
      `);
    });
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }

  const count = document.getElementById('map-pin-count');
  if (count) count.textContent = petsWithLocation.length;
}

// Wire up event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavUser();
  loadHomePets();
  loadCounter();
  loadBrowsePets();
  initMap();

  gateForm('lost-form', 'login-required-lost');
  gateForm('found-form', 'login-required-found');

  initLocationPicker('location-picker-lost', 'lat-lost', 'lng-lost', 'pin-status-lost');
  initLocationPicker('location-picker-found', 'lat-found', 'lng-found', 'pin-status-found');

  const lostForm = document.getElementById('lost-form');
  if (lostForm) lostForm.addEventListener('submit', submitLostForm);

  const foundForm = document.getElementById('found-form');
  if (foundForm) foundForm.addEventListener('submit', submitFoundForm);

  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', submitContactForm);

  const filterType = document.getElementById('filter-type');
  if (filterType) filterType.addEventListener('change', loadBrowsePets);

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', loadBrowsePets);
});
