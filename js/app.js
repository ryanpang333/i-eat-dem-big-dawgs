// ── AUTH ─────────────────────────────────────────────────────────────────────

async function getUser() {
  if (DB_READY) {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  }
  return JSON.parse(localStorage.getItem('pawfinder_user') || 'null');
}

async function loginWithGoogle() {
  if (!DB_READY) {
    alert('Supabase is not set up yet. Use Demo Login instead.');
    return;
  }
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/index.html' }
  });
}

async function logout() {
  if (DB_READY) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem('pawfinder_user');
  }
  window.location.href = 'index.html';
}

function demoLogin() {
  localStorage.setItem('pawfinder_user', JSON.stringify({
    name: 'Ryan (Demo)',
    email: 'ryanpang333@gmail.com',
    picture: 'https://ui-avatars.com/api/?name=Ryan&background=7c3aed&color=fff&size=64',
    demo: true,
  }));
  const returnTo = sessionStorage.getItem('pawfinder_return') || 'index.html';
  sessionStorage.removeItem('pawfinder_return');
  window.location.href = returnTo;
}

async function updateNavUser() {
  const el = document.getElementById('nav-user');
  if (!el) return;
  const user = await getUser();

  if (user) {
    const name = user.user_metadata?.name || user.name || 'User';
    const picture = user.user_metadata?.avatar_url || user.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=64`;
    const firstName = name.replace(' (Demo)', '').split(' ')[0];
    el.innerHTML = `
      <img src="${picture}" alt="${firstName}">
      <span>${firstName}</span>
      <button class="btn-logout" onclick="logout()">Log out</button>
    `;
  } else {
    el.innerHTML = `<a class="btn-login" href="login.html">Sign in with Google</a>`;
  }
}

async function gateForm(formId, bannerId) {
  const user = await getUser();
  const form = document.getElementById(formId);
  const banner = document.getElementById(bannerId);
  if (!form || !banner) return;
  if (!user) {
    form.style.display = 'none';
    banner.style.display = 'block';
  } else {
    const name = user.user_metadata?.name || user.name || '';
    const nameField = form.querySelector('[name="ownerName"], [name="finderName"]');
    if (nameField && !nameField.value) nameField.value = name.replace(' (Demo)', '');
  }
}

// ── DATA ─────────────────────────────────────────────────────────────────────

async function getPets() {
  if (DB_READY) {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  }
  return JSON.parse(localStorage.getItem('pawfinder_pets') || '[]').reverse();
}

async function savePet(pet) {
  if (DB_READY) {
    const { error } = await supabase.from('pets').insert([pet]);
    if (error) throw error;
  } else {
    const pets = JSON.parse(localStorage.getItem('pawfinder_pets') || '[]');
    pets.push(pet);
    localStorage.setItem('pawfinder_pets', JSON.stringify(pets));
  }
}

async function uploadPhoto(file) {
  if (!DB_READY || !file) return null;
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('pet-photos').upload(path, file);
  if (error) { console.error(error); return null; }
  const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(data.path);
  return publicUrl;
}

function getCounter() {
  return parseInt(localStorage.getItem('pawfinder_reunited') || '10');
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function renderCard(pet) {
  const imgSrc = pet.photo_url || pet.photo || 'https://placehold.co/300x150?text=No+Photo';
  const label = pet.type === 'lost' ? 'LOST' : 'FOUND';
  const locationLabel = pet.type === 'lost' ? 'Last seen' : 'Found at';
  return `
    <div class="card">
      <img src="${imgSrc}" alt="${pet.pet_name || pet.petName || 'Pet'}">
      <span class="badge-${pet.type}">${label}</span>
      <h3>${pet.pet_name || pet.petName || 'Unknown'}</h3>
      <p><strong>Animal:</strong> ${pet.animal} ${pet.breed ? '— ' + pet.breed : ''}</p>
      <p><strong>Color:</strong> ${pet.color}</p>
      <p><strong>Size:</strong> ${pet.size}</p>
      <p><strong>${locationLabel}:</strong> ${pet.location}</p>
      <p><strong>Date:</strong> ${pet.date}</p>
      ${pet.special ? `<p><strong>Special:</strong> ${pet.special}</p>` : ''}
      ${pet.reward === true || pet.reward === 'yes' ? `<p style="color:#c62828;font-weight:bold;">Reward offered!</p>` : ''}
      <p style="margin-top:8px;"><strong>Contact:</strong> ${pet.owner_name || pet.ownerName} — ${pet.phone}</p>
      ${pet.lat && pet.lng ? `<a href="map.html" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:#a855f7;">📍 See on map</a>` : ''}
    </div>
  `;
}

// ── PAGES ────────────────────────────────────────────────────────────────────

async function loadHomePets() {
  const container = document.getElementById('home-pets');
  if (!container) return;
  container.innerHTML = '<p class="empty-state">Loading...</p>';
  const pets = (await getPets()).filter(p => p.type === 'lost').slice(0, 3);
  if (pets.length === 0) {
    container.innerHTML = '<p class="empty-state">No lost pets posted yet. Be the first!</p>';
    return;
  }
  container.innerHTML = pets.map(renderCard).join('');
}

function loadCounter() {
  const el = document.getElementById('reunited-count');
  if (el) el.textContent = getCounter();
}

async function loadBrowsePets() {
  const container = document.getElementById('browse-pets');
  if (!container) return;
  const filter = document.getElementById('filter-type');
  const search = document.getElementById('search-input');

  container.innerHTML = '<p class="empty-state">Loading...</p>';
  let pets = await getPets();

  if (filter && filter.value !== 'all') {
    pets = pets.filter(p => p.type === filter.value);
  }
  if (search && search.value.trim()) {
    const q = search.value.toLowerCase();
    pets = pets.filter(p =>
      (p.pet_name || p.petName || '').toLowerCase().includes(q) ||
      p.animal.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }
  if (pets.length === 0) {
    container.innerHTML = '<p class="empty-state">No pets found. Try adjusting your search.</p>';
    return;
  }
  container.innerHTML = pets.map(renderCard).join('');
}

// ── FORMS ────────────────────────────────────────────────────────────────────

function initLocationPicker(mapDivId, latInputId, lngInputId, statusId) {
  const mapDiv = document.getElementById(mapDivId);
  if (!mapDiv) return;
  const pickerMap = L.map(mapDivId).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(pickerMap);
  let marker = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      pickerMap.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }
  pickerMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(pickerMap);
    document.getElementById(latInputId).value = lat.toFixed(6);
    document.getElementById(lngInputId).value = lng.toFixed(6);
    const status = document.getElementById(statusId);
    status.textContent = `📍 Pin dropped! (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    status.style.color = '#a855f7';
  });
}

async function submitLostForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.submit-btn');
  btn.textContent = 'Posting...';
  btn.disabled = true;

  try {
    const photoFile = form.photo.files[0];
    let photoUrl = null;
    if (photoFile) {
      if (DB_READY) {
        photoUrl = await uploadPhoto(photoFile);
      } else {
        photoUrl = await new Promise(res => {
          const r = new FileReader();
          r.onload = e => res(e.target.result);
          r.readAsDataURL(photoFile);
        });
      }
    }

    const user = await getUser();
    const pet = {
      type: 'lost',
      owner_name: form.ownerName.value,
      phone: form.phone.value,
      pet_name: form.petName.value,
      animal: form.animal.value,
      breed: form.breed.value,
      color: form.color.value,
      size: form.size.value,
      photo_url: photoUrl,
      location: form.location.value,
      date: form.date.value,
      special: form.special.value,
      reward: form.reward.value === 'yes',
      lat: parseFloat(form.lat.value) || null,
      lng: parseFloat(form.lng.value) || null,
      user_id: user?.id || null,
    };

    await savePet(pet);
    form.reset();
    document.getElementById('pin-status-lost').textContent = 'No location selected yet.';
    document.getElementById('pin-status-lost').style.color = '#888';
    document.getElementById('success-lost').style.display = 'block';
    setTimeout(() => document.getElementById('success-lost').style.display = 'none', 4000);
  } catch (err) {
    alert('Error posting pet: ' + err.message);
  } finally {
    btn.textContent = 'Post Lost Pet Notice';
    btn.disabled = false;
  }
}

async function submitFoundForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.submit-btn');
  btn.textContent = 'Posting...';
  btn.disabled = true;

  try {
    const photoFile = form.photo.files[0];
    let photoUrl = null;
    if (photoFile) {
      if (DB_READY) {
        photoUrl = await uploadPhoto(photoFile);
      } else {
        photoUrl = await new Promise(res => {
          const r = new FileReader();
          r.onload = e => res(e.target.result);
          r.readAsDataURL(photoFile);
        });
      }
    }

    const user = await getUser();
    const pet = {
      type: 'found',
      owner_name: form.finderName.value,
      phone: form.phone.value,
      pet_name: 'Unknown',
      animal: form.animal.value,
      breed: '',
      color: form.color.value,
      size: form.size.value,
      photo_url: photoUrl,
      location: form.location.value,
      date: form.date.value,
      special: form.special.value,
      reward: false,
      lat: parseFloat(form.lat.value) || null,
      lng: parseFloat(form.lng.value) || null,
      user_id: user?.id || null,
    };

    await savePet(pet);
    form.reset();
    document.getElementById('pin-status-found').textContent = 'No location selected yet.';
    document.getElementById('pin-status-found').style.color = '#888';
    document.getElementById('success-found').style.display = 'block';
    setTimeout(() => document.getElementById('success-found').style.display = 'none', 4000);
  } catch (err) {
    alert('Error posting pet: ' + err.message);
  } finally {
    btn.textContent = 'Post Found Pet Notice';
    btn.disabled = false;
  }
}

function submitContactForm(e) {
  e.preventDefault();
  e.target.reset();
  document.getElementById('success-contact').style.display = 'block';
  setTimeout(() => document.getElementById('success-contact').style.display = 'none', 4000);
}

// ── MAP ──────────────────────────────────────────────────────────────────────

async function initMap() {
  if (!document.getElementById('map')) return;
  const map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const pets = (await getPets()).filter(p => p.lat && p.lng);
  const bounds = [];

  pets.forEach(pet => {
    bounds.push([pet.lat, pet.lng]);
    const color = pet.type === 'lost' ? '#c62828' : '#1b5e20';
    const imgTag = (pet.photo_url || pet.photo)
      ? `<img src="${pet.photo_url || pet.photo}" style="width:100%;max-height:100px;object-fit:cover;border-radius:6px;margin-bottom:6px;">`
      : '';
    const marker = L.circleMarker([pet.lat, pet.lng], {
      color, fillColor: color, fillOpacity: 0.85, radius: 10, weight: 2,
    }).addTo(map);
    marker.bindPopup(`
      <div style="min-width:160px;">
        ${imgTag}
        <strong>${pet.pet_name || pet.petName || 'Unknown'}</strong>
        <span style="background:${color};color:white;font-size:0.7rem;padding:1px 6px;border-radius:10px;margin-left:4px;">${pet.type.toUpperCase()}</span><br>
        <b>Animal:</b> ${pet.animal}<br>
        <b>Color:</b> ${pet.color}<br>
        <b>Location:</b> ${pet.location}<br>
        <b>Date:</b> ${pet.date}<br>
        <b>Contact:</b> ${pet.owner_name || pet.ownerName} — ${pet.phone}
        ${pet.reward === true || pet.reward === 'yes' ? '<br><b style="color:#c62828;">Reward offered!</b>' : ''}
      </div>
    `);
  });

  if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  const count = document.getElementById('map-pin-count');
  if (count) count.textContent = pets.length;

  // Real-time: refresh map when new pets are added
  if (DB_READY) {
    supabase.channel('pets-map').on(
      'postgres_changes', { event: 'INSERT', schema: 'public', table: 'pets' },
      () => { map.remove(); initMap(); }
    ).subscribe();
  }
}

// ── REALTIME BROWSE ───────────────────────────────────────────────────────────

function subscribeToNewPets() {
  if (!DB_READY || !document.getElementById('browse-pets')) return;
  supabase.channel('pets-browse').on(
    'postgres_changes', { event: 'INSERT', schema: 'public', table: 'pets' },
    () => loadBrowsePets()
  ).subscribe();
}

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await updateNavUser();
  loadCounter();
  await loadHomePets();
  await loadBrowsePets();
  await initMap();

  await gateForm('lost-form', 'login-required-lost');
  await gateForm('found-form', 'login-required-found');

  initLocationPicker('location-picker-lost', 'lat-lost', 'lng-lost', 'pin-status-lost');
  initLocationPicker('location-picker-found', 'lat-found', 'lng-found', 'pin-status-found');

  subscribeToNewPets();

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
