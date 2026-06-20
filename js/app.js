// ── DATA ─────────────────────────────────────────────────────────────────────

// '' means "Worldwide / show all". Otherwise the name of the chosen country.
let _selectedCountry = localStorage.getItem('pawfinder_country') || '';

async function getPets() {
  const demo = (window.DEMO_PETS || []).map(p => ({ ...p, location: p._fullLocation || p.location }));
  let real = [];
  if (DB_READY) {
    const { data, error } = await supabaseClient
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) real = data;
  } else {
    real = JSON.parse(localStorage.getItem('pawfinder_pets') || '[]').reverse();
  }
  let combined = [...real, ...demo];
  // Filter to the chosen country. Real user posts (no country field) always show.
  if (_selectedCountry) {
    combined = combined.filter(p => !p.country || p.country === _selectedCountry);
  }
  return combined;
}

async function savePet(pet) {
  if (DB_READY) {
    const { error } = await supabaseClient.from('pets').insert([pet]);
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
  const { data, error } = await supabaseClient.storage.from('pet-photos').upload(path, file);
  if (error) { console.error(error); return null; }
  const { data: { publicUrl } } = supabaseClient.storage.from('pet-photos').getPublicUrl(data.path);
  return publicUrl;
}

async function loadCounter() {
  const el = document.getElementById('reunited-count');
  if (!el) return;
  // Count the real reunited pets (respects the chosen country) plus any the user marked.
  const pets = await getPets();
  const base = pets.filter(p => p.reunited || p.status === 'reunited').length;
  const bonus = parseInt(localStorage.getItem('pawfinder_reunited_bonus') || '0');
  const target = base + bonus;
  const duration = 1200;
  const startTime = performance.now();
  (function tick(now) {
    const t = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
    if (t < 1) requestAnimationFrame(tick);
  })(performance.now());
}

function initDarkMode() {
  const saved = localStorage.getItem('pawfinder_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  const nav = document.querySelector('nav');
  if (!nav) return;
  const btn = document.createElement('button');
  btn.className = 'dark-toggle';
  const update = () => {
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️ Light' : '🌙 Dark';
  };
  update();
  btn.onclick = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (dark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('pawfinder_theme', 'light'); }
    else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('pawfinder_theme', 'dark'); }
    update();
  };
  nav.appendChild(btn);
}

// ── PET STORE ────────────────────────────────────────────────────────────────

const petStore = new Map();
let _seq = 0;

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(String(dateStr).split(' at ')[0]);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

async function processPhoto(file) {
  if (!file) return null;
  if (DB_READY) return uploadPhoto(file);
  return new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(file); });
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function renderCard(pet) {
  const key = pet.id ? String(pet.id) : `local-${++_seq}`;
  petStore.set(key, pet);

  const label = pet.type === 'lost' ? 'LOST' : 'FOUND';
  const locationLabel = pet.type === 'lost' ? 'Last seen' : 'Found at';
  const isReunited = pet.status === 'reunited';
  const hasReward = pet.reward === true || pet.reward === 'yes';
  const phoneSafe = escHtml(pet.phone || '');
  const emailSafe = escHtml(pet.email || '');
  const phonePrivate = !!pet.phone_hidden;
  const name = escHtml(pet.pet_name || pet.petName || 'Unknown');

  const days = daysSince(pet.date);
  const isUrgent = pet.type === 'lost' && !isReunited && days !== null && days >= 7;

  const photos = [pet.photo_url, pet.photo_url_2, pet.photo_url_3, pet.photo].filter(Boolean);
  if (!photos.length) photos.push('https://placehold.co/300x150?text=No+Photo');

  const gallery = `
    <div class="pet-gallery" id="gallery-${key}" data-current="0">
      <img class="gallery-img" src="${escHtml(photos[0])}" alt="${name}">
      ${photos.length > 1 ? `
        <button class="gallery-nav gallery-prev" onclick="galleryNav('${key}',-1)">‹</button>
        <button class="gallery-nav gallery-next" onclick="galleryNav('${key}',1)">›</button>
        <div class="gallery-dots">
          ${photos.map((_,i) => `<span class="gallery-dot${i===0?' active':''}" onclick="galleryGoto('${key}',${i})"></span>`).join('')}
        </div>` : ''}
    </div>`;

  const petId = pet.id || key;
  const sightCount = JSON.parse(localStorage.getItem(`sightings_${petId}`) || '[]').length;

  let contactRows = `<p style="margin-top:8px;"><strong>Contact:</strong> ${escHtml(pet.owner_name || pet.ownerName)}</p>`;
  if (phoneSafe) {
    contactRows += phonePrivate
      ? `<p style="font-size:0.85rem;color:#888;margin-top:4px;">📞 <em>Phone hidden by poster</em></p>`
      : `<p style="font-size:0.85rem;margin-top:4px;">📞 <span id="phone-val-${key}" style="display:none;font-weight:bold;">${phoneSafe}</span><button class="action-btn" id="phone-toggle-${key}" onclick="togglePhone('${key}')">🔒 Show Phone</button></p>`;
  }
  if (emailSafe) {
    contactRows += `<p style="font-size:0.85rem;margin-top:4px;">📧 <span id="email-val-${key}" style="display:none;font-weight:bold;">${emailSafe}</span><button class="action-btn" id="email-toggle-${key}" onclick="toggleEmail('${key}')">🔒 Show Email</button></p>`;
  }
  if (!phoneSafe && !emailSafe) {
    contactRows += `<p style="font-size:0.85rem;color:#888;margin-top:4px;"><em>No contact info provided</em></p>`;
  }

  return `
    <div class="card${isReunited ? ' card-reunited' : ''}${isUrgent ? ' card-urgent' : ''}${hasReward && !isReunited ? ' card-reward' : ''}">
      ${isReunited ? '<div class="reunited-banner">🎉 REUNITED!</div>' : ''}
      ${isUrgent ? '<div class="urgent-badge">🚨 URGENT — Missing over a week!</div>' : ''}
      ${hasReward && !isReunited ? '<div class="reward-banner">💰 REWARD OFFERED</div>' : ''}
      ${gallery}
      <span class="badge-${pet.type}">${label}</span>
      <h3>${name}</h3>
      <p><strong>Animal:</strong> ${escHtml(pet.animal)} ${pet.breed ? '— ' + escHtml(pet.breed) : ''}</p>
      <p><strong>Color:</strong> ${escHtml(pet.color)}</p>
      ${pet.age ? `<p><strong>Age:</strong> ${escHtml(pet.age)}</p>` : ''}
      <p><strong>Size:</strong> ${escHtml(pet.size)}</p>
      <p><strong>${locationLabel}:</strong> ${escHtml(pet.location)}</p>
      <p><strong>Date:</strong> ${escHtml(pet.date)}</p>
      ${days !== null ? `<p class="days-counter${isUrgent?' days-urgent':''}">${pet.type==='lost'?'⏱ Missing':'📅 Found'} ${days===0?'today':`${days} day${days!==1?'s':''} ago`}</p>` : ''}
      ${pet.special ? `<p><strong>Special:</strong> ${escHtml(pet.special)}</p>` : ''}
      ${hasReward ? `<p style="color:#b45309;font-weight:bold;">💰 Reward offered!</p>` : ''}
      ${contactRows}
      ${pet.lat && pet.lng ? `<a href="map.html" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:#f97316;">📍 See on map</a>` : ''}
      <div class="card-actions">
        ${phoneSafe && !phonePrivate ? `<button class="action-btn" onclick="copyPhone('${phoneSafe}',this)">📋 Copy Phone</button>` : ''}
        ${emailSafe ? `<button class="action-btn" onclick="copyEmail('${emailSafe}',this)">📋 Copy Email</button>` : ''}
        <button class="action-btn" onclick="whatsappShare('${key}')">💬 WhatsApp</button>
        <button class="action-btn" onclick="facebookShare('${key}')">📘 Facebook</button>
        <button class="action-btn" onclick="twitterShare('${key}')">🐦 X / Twitter</button>
        <button class="action-btn" onclick="copyPetLink('${key}',this)">🔗 Copy Link</button>
        <button class="action-btn" onclick="printFlyer('${key}')">🖨️ Print Flyer</button>
        ${!isReunited ? `<button class="action-btn btn-spotted" onclick="openSpottingModal('${key}')">👁 Spotted${sightCount?` (${sightCount})`:''}</button>` : ''}
        <button class="action-btn" onclick="openDetailModal('${key}')">🔍 Details</button>
        ${!isReunited && pet.id ? `<button class="action-btn btn-reunited" onclick="markReunited('${key}',this)">🎉 Reunited!</button>` : ''}
      </div>
      <div class="tips-section">
        <div class="tips-input-row">
          <input class="tip-input" id="tip-${key}" type="text" placeholder="Leave a tip or sighting...">
          <button class="action-btn" onclick="submitTip('${key}')">Send</button>
        </div>
        <div class="tips-list" id="tips-list-${key}"></div>
      </div>
    </div>
  `;
}

// ── CARD ACTIONS ─────────────────────────────────────────────────────────────

function togglePhone(key) {
  const val = document.getElementById(`phone-val-${key}`);
  const btn = document.getElementById(`phone-toggle-${key}`);
  if (!val || !btn) return;
  const hidden = val.style.display === 'none';
  val.style.display = hidden ? 'inline' : 'none';
  btn.textContent = hidden ? '🔓 Hide Phone' : '🔒 Show Phone';
}

function toggleEmail(key) {
  const val = document.getElementById(`email-val-${key}`);
  const btn = document.getElementById(`email-toggle-${key}`);
  if (!val || !btn) return;
  const hidden = val.style.display === 'none';
  val.style.display = hidden ? 'inline' : 'none';
  btn.textContent = hidden ? '🔓 Hide Email' : '🔒 Show Email';
}

function copyPhone(phone, btn) {
  navigator.clipboard.writeText(phone).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

function copyEmail(email, btn) {
  navigator.clipboard.writeText(email).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

function whatsappShare(key) {
  const pet = petStore.get(key);
  if (!pet) return;
  const name = pet.pet_name || pet.petName || 'Unknown';
  const label = pet.type === 'lost' ? '🔴 LOST PET' : '🟢 FOUND PET';
  const contact = [
    pet.owner_name || pet.ownerName,
    !pet.phone_hidden && pet.phone ? pet.phone : null,
    pet.email || null,
  ].filter(Boolean).join(' — ');
  const text = `${label}: ${name} (${pet.animal}) near ${pet.location}. Date: ${pet.date}. Contact: ${contact}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function facebookShare(key) {
  const pet = petStore.get(key);
  if (!pet) return;
  const url = encodeURIComponent(window.location.href.split('?')[0] + '?pet=' + encodeURIComponent(pet.id || key));
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function twitterShare(key) {
  const pet = petStore.get(key);
  if (!pet) return;
  const name = pet.pet_name || pet.petName || 'Unknown';
  const text = `${pet.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}: ${name} the ${pet.animal} near ${pet.location}. Can you help? 🐾 #PawFinder #LostPet`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
}

function copyPetLink(key, btn) {
  const pet = petStore.get(key);
  if (!pet) return;
  const url = window.location.href.split('?')[0].replace(/[^/]*$/, 'browse.html') + '?pet=' + encodeURIComponent(pet.id || key);
  navigator.clipboard.writeText(url).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

function sharePost(key) {
  const pet = petStore.get(key);
  if (!pet) return;
  const name = pet.pet_name || pet.petName || 'Unknown';
  const contact = [
    pet.owner_name || pet.ownerName,
    !pet.phone_hidden && pet.phone ? pet.phone : null,
    pet.email || null,
  ].filter(Boolean).join(' — ');
  const text = `${pet.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}: ${name} (${pet.animal}) near ${pet.location}. Date: ${pet.date}. Contact: ${contact}`;
  if (navigator.share) {
    navigator.share({ title: 'Paw Finder', text });
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  }
}

function printFlyer(key) {
  const pet = petStore.get(key);
  if (!pet) return;
  const color = pet.type === 'lost' ? '#c62828' : '#1b5e20';
  const img = (pet.photo_url || pet.photo) ? `<img src="${pet.photo_url || pet.photo}" style="max-width:280px;border-radius:10px;margin:16px auto;display:block;">` : '';
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Paw Finder Flyer</title><style>
    body{font-family:Arial,sans-serif;text-align:center;padding:40px;max-width:520px;margin:0 auto}
    h1{font-size:2.5rem;color:${color};margin:0}
    .name{font-size:2rem;font-weight:bold;margin:12px 0}
    .info{font-size:1.1rem;margin:6px 0;color:#333}
    .phone{font-size:2rem;font-weight:bold;color:#f97316;margin:24px 0;padding:14px;border:3px solid #f97316;border-radius:8px}
    .reward{color:#c62828;font-weight:bold;font-size:1.3rem;margin:10px 0}
    footer{color:#aaa;font-size:0.8rem;margin-top:28px}
  </style></head><body>
  <h1>${pet.type === 'lost' ? '🔴 LOST PET' : '🟢 FOUND PET'}</h1>
  <div class="name">${escHtml(pet.pet_name || pet.petName || 'Unknown')}</div>
  ${img}
  <div class="info"><b>Animal:</b> ${escHtml(pet.animal)}${pet.breed ? ' — ' + escHtml(pet.breed) : ''}</div>
  <div class="info"><b>Colour:</b> ${escHtml(pet.color)} · <b>Size:</b> ${escHtml(pet.size)}</div>
  <div class="info"><b>${pet.type === 'lost' ? 'Last seen' : 'Found at'}:</b> ${escHtml(pet.location)}</div>
  <div class="info"><b>Date:</b> ${escHtml(pet.date)}</div>
  ${pet.special ? `<div class="info"><b>Special marks:</b> ${escHtml(pet.special)}</div>` : ''}
  ${pet.reward === true || pet.reward === 'yes' ? '<div class="reward">💰 REWARD OFFERED</div>' : ''}
  <div class="phone">📞 ${escHtml(pet.phone)}</div>
  <div class="info">Contact: ${escHtml(pet.owner_name || pet.ownerName)}</div>
  <footer>Posted on 🐾 Paw Finder</footer>
  <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  w.document.close();
}

// ── GALLERY ──────────────────────────────────────────────────────────────────

function galleryNav(key, dir) {
  const pet = petStore.get(key);
  if (!pet) return;
  const photos = [pet.photo_url, pet.photo_url_2, pet.photo_url_3, pet.photo].filter(Boolean);
  const gallery = document.getElementById(`gallery-${key}`);
  if (!gallery || photos.length <= 1) return;
  const cur = parseInt(gallery.dataset.current || '0');
  galleryGoto(key, (cur + dir + photos.length) % photos.length);
}

function galleryGoto(key, idx) {
  const pet = petStore.get(key);
  if (!pet) return;
  const photos = [pet.photo_url, pet.photo_url_2, pet.photo_url_3, pet.photo].filter(Boolean);
  const gallery = document.getElementById(`gallery-${key}`);
  if (!gallery) return;
  gallery.dataset.current = idx;
  const img = gallery.querySelector('.gallery-img');
  if (img) img.src = photos[idx] || '';
  gallery.querySelectorAll('.gallery-dot').forEach((d,i) => d.classList.toggle('active', i === idx));
}

// ── SPOTTING MODAL ────────────────────────────────────────────────────────────

function openSpottingModal(key) {
  const now = new Date().toISOString().slice(0,16);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      <h2>👁 I Spotted This Pet!</h2>
      <p>Help the owner by telling them where and when you saw it.</p>
      <div class="form-group" style="margin-top:16px;">
        <label>Where did you see it?</label>
        <input type="text" id="spot-where" placeholder="e.g. Near the park on Elm St"
          style="width:100%;padding:10px;border:1px solid #fed7aa;border-radius:8px;font-size:0.95rem;margin-top:6px;">
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>When?</label>
        <input type="datetime-local" id="spot-when" value="${now}"
          style="width:100%;padding:10px;border:1px solid #fed7aa;border-radius:8px;font-size:0.95rem;margin-top:6px;">
      </div>
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="submit-btn" style="width:auto;padding:10px 20px;" onclick="saveSpotting('${key}',this)">📍 Submit Sighting</button>
        <button class="action-btn" style="padding:10px 16px;" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function saveSpotting(key, btn) {
  const where = document.getElementById('spot-where')?.value.trim();
  const when = document.getElementById('spot-when')?.value;
  if (!where) { alert('Please describe where you saw the pet.'); return; }
  const pet = petStore.get(key);
  const petId = pet?.id || key;
  const sightings = JSON.parse(localStorage.getItem(`sightings_${petId}`) || '[]');
  sightings.push({ where, when: when || new Date().toISOString() });
  localStorage.setItem(`sightings_${petId}`, JSON.stringify(sightings));
  btn.closest('.modal-overlay').remove();
  const spottedBtn = document.querySelector(`[onclick="openSpottingModal('${key}')"]`);
  if (spottedBtn) spottedBtn.textContent = `👁 Spotted (${sightings.length})`;
  alert('✅ Sighting reported! Check the Details view to see all sightings.');
}

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────

function openDetailModal(key) {
  const pet = petStore.get(key);
  if (!pet) return;
  const name = escHtml(pet.pet_name || pet.petName || 'Unknown');
  const photos = [pet.photo_url, pet.photo_url_2, pet.photo_url_3, pet.photo].filter(Boolean);
  const mainImg = photos[0] ? `<img src="${escHtml(photos[0])}" style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;margin-bottom:14px;">` : '';
  const petId = pet.id || key;
  const sightings = JSON.parse(localStorage.getItem(`sightings_${petId}`) || '[]');
  const days = daysSince(pet.date);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box modal-detail">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      ${mainImg}
      <span class="badge-${pet.type}" style="margin-bottom:8px;display:inline-block;">${pet.type==='lost'?'LOST':'FOUND'}</span>
      <h2 style="margin:6px 0;">${name}</h2>
      ${days !== null ? `<p style="color:#aaa;font-size:0.85rem;">⏱ ${pet.type==='lost'?'Missing':'Found'} ${days===0?'today':`${days} day${days!==1?'s':''} ago`}</p>` : ''}
      <hr class="modal-hr">
      <p><strong>Animal:</strong> ${escHtml(pet.animal)}${pet.breed?' — '+escHtml(pet.breed):''}</p>
      <p><strong>Color:</strong> ${escHtml(pet.color)}</p>
      ${pet.age?`<p><strong>Age:</strong> ${escHtml(pet.age)}</p>`:''}
      <p><strong>Size:</strong> ${escHtml(pet.size)}</p>
      <p><strong>${pet.type==='lost'?'Last seen':'Found at'}:</strong> ${escHtml(pet.location)}</p>
      <p><strong>Date:</strong> ${escHtml(pet.date)}</p>
      ${pet.special?`<p><strong>Special:</strong> ${escHtml(pet.special)}</p>`:''}
      ${pet.reward===true||pet.reward==='yes'?`<p style="color:#c62828;font-weight:bold;">💰 Reward offered!</p>`:''}
      <hr class="modal-hr">
      <p><strong>Contact:</strong> ${escHtml(pet.owner_name||pet.ownerName)}</p>
      ${pet.phone&&!pet.phone_hidden?`<p>📞 ${escHtml(pet.phone)}</p>`:''}
      ${pet.phone&&pet.phone_hidden?`<p style="color:#aaa;">📞 Phone private</p>`:''}
      ${pet.email?`<p>📧 ${escHtml(pet.email)}</p>`:''}
      ${sightings.length?`
        <hr class="modal-hr">
        <p><strong>👁 Sightings (${sightings.length})</strong></p>
        ${sightings.map(s=>`<p style="font-size:0.85rem;">📍 ${escHtml(s.where)} — ${s.when?new Date(s.when).toLocaleString():''}</p>`).join('')}
      `:'<p style="color:#aaa;font-size:0.85rem;margin-top:10px;">No sightings reported yet.</p>'}
      <hr class="modal-hr">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
        <button class="action-btn" onclick="copyPetLink('${key}',this)">🔗 Copy Link</button>
        <button class="action-btn" onclick="facebookShare('${key}')">📘 Facebook</button>
        <button class="action-btn" onclick="twitterShare('${key}')">🐦 X / Twitter</button>
        <button class="action-btn" onclick="printFlyer('${key}')">🖨️ Print Flyer</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── SHELTERS ─────────────────────────────────────────────────────────────────

let shelterMarkers = [];

async function toggleShelters(show) {
  shelterMarkers.forEach(m => mapInstance && mapInstance.removeLayer(m));
  shelterMarkers = [];
  if (!show || !mapInstance) return;
  const c = mapInstance.getCenter();
  const q = `[out:json];(node["amenity"="veterinary"](around:8000,${c.lat},${c.lng});node["amenity"="animal_shelter"](around:8000,${c.lat},${c.lng}););out;`;
  try {
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
    const data = await res.json();
    data.elements.forEach(el => {
      if (!el.lat || !el.lon) return;
      const m = L.circleMarker([el.lat, el.lon], { color:'#0369a1', fillColor:'#0ea5e9', fillOpacity:0.9, radius:9, weight:2 }).addTo(mapInstance);
      m.bindPopup(`<strong>🏥 ${escHtml(el.tags?.name||'Animal Shelter / Vet')}</strong><br><small>${escHtml(el.tags?.['addr:street']||'')}</small>`);
      shelterMarkers.push(m);
    });
  } catch { alert('Could not load shelters. Try again.'); }
}

async function markReunited(key, btn) {
  if (!confirm('Mark this pet as reunited? 🎉')) return;
  const pet = petStore.get(key);
  if (DB_READY && pet?.id) {
    const { error } = await supabaseClient.from('pets').update({ status: 'reunited' }).eq('id', pet.id);
    if (error) { alert('Could not update: ' + error.message); return; }
  }
  const card = btn.closest('.card');
  card.classList.add('card-reunited');
  if (!card.querySelector('.reunited-banner')) {
    card.insertAdjacentHTML('afterbegin', '<div class="reunited-banner">🎉 REUNITED!</div>');
  }
  btn.remove();
  const bonus = parseInt(localStorage.getItem('pawfinder_reunited_bonus') || '0') + 1;
  localStorage.setItem('pawfinder_reunited_bonus', bonus);
  const el = document.getElementById('reunited-count');
  if (el) el.textContent = (parseInt(el.textContent) || 0) + 1;
}

// ── TIPS ─────────────────────────────────────────────────────────────────────

async function submitTip(key) {
  const input = document.getElementById(`tip-${key}`);
  const text = input?.value.trim();
  if (!text) return;
  const pet = petStore.get(key);
  const petId = pet?.id || key;
  const tip = { pet_id: petId, message: text, created_at: new Date().toISOString() };

  if (DB_READY) {
    const { error } = await supabaseClient.from('tips').insert([tip]);
    if (error) {
      const tips = JSON.parse(localStorage.getItem(`tips_${petId}`) || '[]');
      tips.push(tip);
      localStorage.setItem(`tips_${petId}`, JSON.stringify(tips));
    }
  } else {
    const tips = JSON.parse(localStorage.getItem(`tips_${petId}`) || '[]');
    tips.push(tip);
    localStorage.setItem(`tips_${petId}`, JSON.stringify(tips));
  }
  input.value = '';
  loadTips(key);
}

async function loadTips(key) {
  const list = document.getElementById(`tips-list-${key}`);
  if (!list) return;
  const pet = petStore.get(key);
  const petId = pet?.id || key;
  let tips = [];

  if (DB_READY) {
    const { data } = await supabaseClient.from('tips').select('*').eq('pet_id', petId).order('created_at');
    tips = data || [];
  }
  if (!tips.length) {
    tips = JSON.parse(localStorage.getItem(`tips_${petId}`) || '[]');
  }
  list.innerHTML = tips.map(t => `<div class="tip-item">💬 ${escHtml(t.message)}</div>`).join('');
}

// ── DISTANCE ─────────────────────────────────────────────────────────────────

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let _userLoc = null;
function getUserLocation() {
  if (_userLoc) return Promise.resolve(_userLoc);
  return new Promise((res, rej) => {
    if (!navigator.geolocation) { rej('No geolocation'); return; }
    navigator.geolocation.getCurrentPosition(
      p => { _userLoc = { lat: p.coords.latitude, lng: p.coords.longitude }; res(_userLoc); },
      rej
    );
  });
}

// ── REUNITED TICKER ──────────────────────────────────────────────────────────

async function loadReunitedTicker() {
  const ticker = document.getElementById('reunited-ticker');
  if (!ticker) return;
  const pets = await getPets();
  const reunited = pets.filter(p => p.reunited || p.status === 'reunited');
  if (!reunited.length) { ticker.style.display = 'none'; return; }
  const items = reunited.slice(0, 20).map(p => {
    const name = p.pet_name || p.petName || 'Unknown';
    return `<span class="ticker-item">🎉 <strong>${escHtml(name)}</strong> the ${escHtml(p.animal)} reunited in ${escHtml(p.location.split(',').slice(-1)[0].trim() || p.location)}</span>`;
  }).join('<span class="ticker-sep">•</span>');
  const inner = ticker.querySelector('.ticker-inner');
  if (inner) { inner.innerHTML = items + '<span class="ticker-sep">•</span>' + items; }
}

// ── PAGES ────────────────────────────────────────────────────────────────────

async function loadHomePets() {
  const container = document.getElementById('home-pets');
  if (!container) return;
  container.innerHTML = '<p class="empty-state">Loading...</p>';
  const pets = (await getPets()).filter(p => p.type === 'lost').slice(0, 3);
  if (!pets.length) {
    container.innerHTML = '<p class="empty-state">No lost pets posted yet. Be the first!</p>';
    return;
  }
  container.innerHTML = pets.map(renderCard).join('');
  pets.filter(p => p.id).forEach(p => loadTips(String(p.id)));
}

let _browseAllPets = [];
let _browsePage = 0;
const BROWSE_PAGE_SIZE = 24;

async function loadBrowsePets() {
  const container = document.getElementById('browse-pets');
  if (!container) return;
  const filter = document.getElementById('filter-type');
  const search = document.getElementById('search-input');
  const nearMe = document.getElementById('near-me');
  const radiusEl = document.getElementById('radius-km');

  container.innerHTML = '<p class="empty-state">Loading...</p>';
  let pets = await getPets();

  if (filter && filter.value !== 'all') pets = pets.filter(p => p.type === filter.value);
  if (search && search.value.trim()) {
    const q = search.value.toLowerCase();
    pets = pets.filter(p =>
      (p.pet_name || p.petName || '').toLowerCase().includes(q) ||
      p.animal.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }
  if (nearMe && nearMe.checked) {
    try {
      const loc = await getUserLocation();
      const km = parseFloat(radiusEl?.value) || 10;
      pets = pets.filter(p => p.lat && p.lng && haversine(loc.lat, loc.lng, p.lat, p.lng) <= km);
    } catch {
      alert('Could not get your location. Please allow location access.');
      nearMe.checked = false;
    }
  }

  const sizeFilter = document.getElementById('filter-size')?.value;
  const activeSwatchColor = document.querySelector('.swatch-btn.swatch-active')?.dataset.color || '';
  const colorFilter = activeSwatchColor || document.getElementById('filter-color')?.value.trim().toLowerCase() || '';
  if (sizeFilter) pets = pets.filter(p => p.size === sizeFilter);
  if (colorFilter) pets = pets.filter(p => (p.color || '').toLowerCase().includes(colorFilter));

  const sort = document.getElementById('sort-order')?.value || 'newest';
  if (sort === 'oldest') pets = [...pets].reverse();
  else if (sort === 'az') pets = [...pets].sort((a, b) => (a.pet_name || a.petName || '').localeCompare(b.pet_name || b.petName || ''));

  if (!pets.length) {
    container.innerHTML = '<p class="empty-state">No pets found. Try adjusting your search.</p>';
    return;
  }

  _browseAllPets = pets;
  _browsePage = 0;
  renderBrowsePage(true);
}

function renderBrowsePage(reset) {
  const container = document.getElementById('browse-pets');
  if (!container) return;
  const start = _browsePage * BROWSE_PAGE_SIZE;
  const page = _browseAllPets.slice(start, start + BROWSE_PAGE_SIZE);
  const remaining = _browseAllPets.length - (start + BROWSE_PAGE_SIZE);

  if (reset) {
    container.innerHTML = page.map(renderCard).join('');
  } else {
    container.querySelector('.load-more-wrap')?.remove();
    page.forEach(pet => {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderCard(pet);
      container.appendChild(tmp.firstElementChild);
    });
  }
  page.filter(p => p.id).forEach(p => loadTips(String(p.id)));

  if (remaining > 0) {
    const wrap = document.createElement('div');
    wrap.className = 'load-more-wrap';
    wrap.innerHTML = `<button class="action-btn load-more-btn" onclick="loadMoreBrowse()">Load ${Math.min(BROWSE_PAGE_SIZE, remaining)} more <span style="color:#aaa;">(${remaining} remaining)</span></button>`;
    container.appendChild(wrap);
  }
}

function loadMoreBrowse() {
  _browsePage++;
  renderBrowsePage(false);
}

// ── PHOTO INPUT ──────────────────────────────────────────────────────────────

function setupPhotoInput(cameraBtnId, galleryId, previewId) {
  const cameraBtn = document.getElementById(cameraBtnId);
  const galleryInput = document.getElementById(galleryId);

  const showPreview = (blob) => {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    const url = URL.createObjectURL(blob);
    preview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:8px;border:2px solid #f97316;">`;
  };

  if (galleryInput) {
    galleryInput.addEventListener('change', () => {
      if (galleryInput.files[0]) showPreview(galleryInput.files[0]);
    });
  }

  if (cameraBtn && galleryInput) {
    cameraBtn.addEventListener('click', async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Camera not supported on this device/browser.');
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      } catch {
        alert('Could not access camera. Please allow camera permission and try again.');
        return;
      }

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;';

      const video = document.createElement('video');
      video.style.cssText = 'width:100%;max-width:500px;max-height:60vh;border-radius:10px;object-fit:cover;';
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;

      const snapBtn = document.createElement('button');
      snapBtn.textContent = '📸 Take Photo';
      snapBtn.style.cssText = 'padding:14px 32px;background:#7c3aed;color:white;border:none;border-radius:8px;font-size:1.05rem;font-weight:bold;cursor:pointer;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '✕ Cancel';
      cancelBtn.style.cssText = 'padding:10px 24px;background:rgba(255,255,255,0.15);color:white;border:none;border-radius:8px;font-size:0.95rem;cursor:pointer;';

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:12px;';
      btnRow.append(snapBtn, cancelBtn);
      overlay.append(video, btnRow);
      document.body.appendChild(overlay);

      const cleanup = () => {
        stream.getTracks().forEach(t => t.stop());
        document.body.removeChild(overlay);
      };

      cancelBtn.onclick = cleanup;

      snapBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext('2d').drawImage(video, 0, 0);
        cleanup();
        canvas.toBlob(blob => {
          if (!blob) return;
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          try {
            const dt = new DataTransfer();
            dt.items.add(file);
            galleryInput.files = dt.files;
          } catch {}
          showPreview(blob);
        }, 'image/jpeg', 0.92);
      };
    });
  }
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
    navigator.geolocation.getCurrentPosition(pos => {
      pickerMap.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }
  pickerMap.on('click', e => {
    const { lat, lng } = e.latlng;
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(pickerMap);
    document.getElementById(latInputId).value = lat.toFixed(6);
    document.getElementById(lngInputId).value = lng.toFixed(6);
    const status = document.getElementById(statusId);
    status.textContent = `📍 Pin dropped! (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    status.style.color = '#f97316';
  });
}

async function submitLostForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.submit-btn');
  btn.textContent = 'Posting...'; btn.disabled = true;
  try {
    const phone = form.phone?.value.trim();
    const email = form.email?.value.trim();
    if (!phone && !email) {
      alert('Please provide at least a phone number or email so people can contact you.');
      btn.textContent = 'Post Lost Pet Notice'; btn.disabled = false;
      return;
    }
    const [photoUrl, photoUrl2, photoUrl3] = await Promise.all([
      processPhoto(form.photo?.files[0]),
      processPhoto(form.photo2?.files[0]),
      processPhoto(form.photo3?.files[0]),
    ]);
    const locParts = [form.location?.value, form.state?.value, form.country?.value].filter(Boolean);
    const timeSeen = form.time_seen?.value;
    await savePet({
      type: 'lost', owner_name: form.ownerName.value, phone: phone || '',
      email: email || '', phone_hidden: !!form.phone_hidden?.checked,
      pet_name: form.petName.value, animal: form.animal.value, breed: form.breed.value,
      color: form.color.value, size: form.size.value, age: form.age?.value || '',
      photo_url: photoUrl, photo_url_2: photoUrl2, photo_url_3: photoUrl3,
      location: locParts.join(', ') || 'Unknown',
      date: form.date.value + (timeSeen ? ' at ' + timeSeen : ''),
      special: form.special.value,
      reward: form.reward.value === 'yes',
      lat: parseFloat(form.lat.value) || null, lng: parseFloat(form.lng.value) || null,
    });
    form.reset();
    document.getElementById('pin-status-lost').textContent = 'No location selected yet.';
    document.getElementById('pin-status-lost').style.color = '#888';
    ['photo-preview-lost','photo-preview2-lost','photo-preview3-lost'].forEach(id => {
      const el = document.getElementById(id); if (el) el.innerHTML = '';
    });
    const s = document.getElementById('success-lost');
    s.style.display = 'block';
    setTimeout(() => s.style.display = 'none', 4000);
  } catch (err) {
    alert('Error posting pet: ' + err.message);
  } finally {
    btn.textContent = 'Post Lost Pet Notice'; btn.disabled = false;
  }
}

async function submitFoundForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.submit-btn');
  btn.textContent = 'Posting...'; btn.disabled = true;
  try {
    const phone = form.phone?.value.trim();
    const email = form.email?.value.trim();
    if (!phone && !email) {
      alert('Please provide at least a phone number or email so people can contact you.');
      btn.textContent = 'Post Found Pet Notice'; btn.disabled = false;
      return;
    }
    const [photoUrl, photoUrl2, photoUrl3] = await Promise.all([
      processPhoto(form.photo?.files[0]),
      processPhoto(form.photo2?.files[0]),
      processPhoto(form.photo3?.files[0]),
    ]);
    const locParts = [form.location?.value, form.state?.value, form.country?.value].filter(Boolean);
    const timeSeen = form.time_seen?.value;
    await savePet({
      type: 'found', owner_name: form.finderName.value, phone: phone || '',
      email: email || '', phone_hidden: !!form.phone_hidden?.checked,
      pet_name: 'Unknown', animal: form.animal.value, breed: '',
      color: form.color.value, size: form.size.value, age: form.age?.value || '',
      photo_url: photoUrl, photo_url_2: photoUrl2, photo_url_3: photoUrl3,
      location: locParts.join(', ') || 'Unknown',
      date: form.date.value + (timeSeen ? ' at ' + timeSeen : ''),
      special: form.special.value,
      reward: false,
      lat: parseFloat(form.lat.value) || null, lng: parseFloat(form.lng.value) || null,
    });
    form.reset();
    document.getElementById('pin-status-found').textContent = 'No location selected yet.';
    document.getElementById('pin-status-found').style.color = '#888';
    ['photo-preview-found','photo-preview2-found','photo-preview3-found'].forEach(id => {
      const el = document.getElementById(id); if (el) el.innerHTML = '';
    });
    const s = document.getElementById('success-found');
    s.style.display = 'block';
    setTimeout(() => s.style.display = 'none', 4000);
  } catch (err) {
    alert('Error posting pet: ' + err.message);
  } finally {
    btn.textContent = 'Post Found Pet Notice'; btn.disabled = false;
  }
}

function submitContactForm(e) {
  e.preventDefault(); e.target.reset();
  const s = document.getElementById('success-contact');
  s.style.display = 'block';
  setTimeout(() => s.style.display = 'none', 4000);
}

// ── MAP ──────────────────────────────────────────────────────────────────────

let mapInstance = null;
let mapMarkers = [];
let heatLayer = null;
let allMapPets = [];

async function initMap() {
  if (!document.getElementById('map')) return;
  mapInstance = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);

  allMapPets = (await getPets()).filter(p => p.lat && p.lng);
  renderMapMarkers();

  const count = document.getElementById('map-pin-count');
  if (count) count.textContent = allMapPets.length;

  if (DB_READY) {
    supabaseClient.channel('pets-map').on(
      'postgres_changes', { event: 'INSERT', schema: 'public', table: 'pets' },
      async () => {
        allMapPets = (await getPets()).filter(p => p.lat && p.lng);
        renderMapMarkers();
        if (count) count.textContent = allMapPets.length;
      }
    ).subscribe();
  }
}

function renderMapMarkers() {
  if (!mapInstance) return;
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];
  if (heatLayer) { mapInstance.removeLayer(heatLayer); heatLayer = null; }

  const showLost   = document.getElementById('filter-lost')?.checked ?? true;
  const showFound  = document.getElementById('filter-found')?.checked ?? true;
  const animalVal  = document.getElementById('map-animal-filter')?.value || 'all';
  const showHeat   = document.getElementById('toggle-heatmap')?.checked ?? false;

  const filtered = allMapPets.filter(p => {
    if (p.type === 'lost'  && !showLost)  return false;
    if (p.type === 'found' && !showFound) return false;
    if (animalVal !== 'all' && p.animal !== animalVal) return false;
    return true;
  });

  if (showHeat && typeof L.heatLayer === 'function') {
    heatLayer = L.heatLayer(filtered.map(p => [p.lat, p.lng, 1]), { radius: 35, blur: 25, maxZoom: 12 }).addTo(mapInstance);
    return;
  }

  const bounds = [];
  filtered.forEach(pet => {
    bounds.push([pet.lat, pet.lng]);
    const color = pet.type === 'lost' ? '#c62828' : '#1b5e20';
    const imgTag = (pet.photo_url || pet.photo)
      ? `<img src="${pet.photo_url || pet.photo}" style="width:100%;max-height:100px;object-fit:cover;border-radius:6px;margin-bottom:6px;">` : '';
    const m = L.circleMarker([pet.lat, pet.lng], {
      color, fillColor: color, fillOpacity: 0.85, radius: 10, weight: 2,
    }).addTo(mapInstance);
    m.bindPopup(`
      <div style="min-width:160px;">
        ${imgTag}
        <strong>${escHtml(pet.pet_name || pet.petName || 'Unknown')}</strong>
        <span style="background:${color};color:white;font-size:0.7rem;padding:1px 6px;border-radius:10px;margin-left:4px;">${pet.type.toUpperCase()}</span><br>
        <b>Animal:</b> ${escHtml(pet.animal)}<br>
        <b>Color:</b> ${escHtml(pet.color)}<br>
        <b>Location:</b> ${escHtml(pet.location)}<br>
        <b>Date:</b> ${escHtml(pet.date)}<br>
        <b>Contact:</b> ${escHtml(pet.owner_name || pet.ownerName)} — ${escHtml(pet.phone)}
        ${pet.reward === true || pet.reward === 'yes' ? '<br><b style="color:#c62828;">Reward offered!</b>' : ''}
      </div>
    `);
    mapMarkers.push(m);
  });
  if (bounds.length) mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
}

// ── REALTIME BROWSE ───────────────────────────────────────────────────────────

function subscribeToNewPets() {
  if (!DB_READY || !document.getElementById('browse-pets')) return;
  supabaseClient.channel('pets-browse').on(
    'postgres_changes', { event: 'INSERT', schema: 'public', table: 'pets' },
    () => loadBrowsePets()
  ).subscribe();
}

// ── COUNTRY SELECTION ─────────────────────────────────────────────────────────

// Country name → ISO-2 code. The flag emoji is generated from the code.
const COUNTRY_ISO = {
  'United States':'US','Canada':'CA','United Kingdom':'GB','Ireland':'IE','Australia':'AU',
  'New Zealand':'NZ','Germany':'DE','Austria':'AT','France':'FR','Netherlands':'NL',
  'Belgium':'BE','Spain':'ES','Italy':'IT','Portugal':'PT','Singapore':'SG','India':'IN',
  'Japan':'JP','South Korea':'KR','China':'CN','Indonesia':'ID','Philippines':'PH',
  'Thailand':'TH','Brazil':'BR','Argentina':'AR','Chile':'CL','Mexico':'MX',
  'South Africa':'ZA','Nigeria':'NG','Kenya':'KE','Egypt':'EG',
  'Switzerland':'CH','Liechtenstein':'LI','Luxembourg':'LU','Monaco':'MC','Denmark':'DK',
  'Sweden':'SE','Norway':'NO','Finland':'FI','Iceland':'IS','Poland':'PL','Czech Republic':'CZ',
  'Slovakia':'SK','Hungary':'HU','Romania':'RO','Moldova':'MD','Bulgaria':'BG','Greece':'GR',
  'Cyprus':'CY','Croatia':'HR','Serbia':'RS','Bosnia and Herzegovina':'BA','Slovenia':'SI',
  'North Macedonia':'MK','Montenegro':'ME','Albania':'AL','Kosovo':'XK','Ukraine':'UA',
  'Belarus':'BY','Russia':'RU','Estonia':'EE','Latvia':'LV','Lithuania':'LT','Malta':'MT',
  'San Marino':'SM','Turkey':'TR','Azerbaijan':'AZ','Georgia':'GE','Armenia':'AM',
  'Saudi Arabia':'SA','United Arab Emirates':'AE','Qatar':'QA','Kuwait':'KW','Bahrain':'BH',
  'Oman':'OM','Yemen':'YE','Jordan':'JO','Lebanon':'LB','Syria':'SY','Iraq':'IQ','Palestine':'PS',
  'Morocco':'MA','Algeria':'DZ','Tunisia':'TN','Libya':'LY','Sudan':'SD','Israel':'IL','Iran':'IR',
  'Afghanistan':'AF','Tajikistan':'TJ','Pakistan':'PK','Maldives':'MV','Bangladesh':'BD',
  'Sri Lanka':'LK','Nepal':'NP','Bhutan':'BT','Vietnam':'VN','Cambodia':'KH','Laos':'LA',
  'Myanmar':'MM','Malaysia':'MY','Brunei':'BN','Taiwan':'TW','Hong Kong':'HK','Mongolia':'MN',
  'Kazakhstan':'KZ','Uzbekistan':'UZ','Kyrgyzstan':'KG','Turkmenistan':'TM','Ghana':'GH',
  'Ivory Coast':'CI','Senegal':'SN','Cameroon':'CM','DR Congo':'CD','Madagascar':'MG',
  'Ethiopia':'ET','Tanzania':'TZ','Uganda':'UG','Rwanda':'RW','Angola':'AO','Mozambique':'MZ',
  'Zambia':'ZM','Zimbabwe':'ZW','Botswana':'BW','Namibia':'NA','Jamaica':'JM',
  'Trinidad and Tobago':'TT','Fiji':'FJ','Papua New Guinea':'PG','Haiti':'HT','Colombia':'CO',
  'Peru':'PE','Venezuela':'VE','Ecuador':'EC','Bolivia':'BO','Paraguay':'PY','Uruguay':'UY',
  'Cuba':'CU','Dominican Republic':'DO','Guatemala':'GT','Costa Rica':'CR','Panama':'PA',
  'Honduras':'HN','El Salvador':'SV','Nicaragua':'NI',
};

function isoToFlag(cc) {
  return cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function flagFor(country) {
  const cc = COUNTRY_ISO[country];
  return cc ? isoToFlag(cc) : '🏳️';
}

// All countries that actually have pets, sorted alphabetically.
function getCountryList() {
  const set = new Set((window.DEMO_PETS || []).map(p => p.country).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}

function showCountryPicker(force) {
  const countries = getCountryList();
  const current = _selectedCountry;
  const options = ['<option value="">🌍 Worldwide — show every country</option>']
    .concat(countries.map(c =>
      `<option value="${escHtml(c)}"${c === current ? ' selected' : ''}>${flagFor(c)} ${escHtml(c)}</option>`
    )).join('');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:430px;text-align:center;">
      ${force ? '' : '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button>'}
      <div style="font-size:2.8rem;line-height:1;">🌍🐾</div>
      <h2 style="margin:10px 0 4px;">Welcome to Paw Finder!</h2>
      <p style="color:#888;margin:0 0 4px;">Choose your country so we can show you the lost &amp; found pets near you.</p>
      <select id="country-picker-select" style="width:100%;padding:12px;border:2px solid #f97316;border-radius:8px;font-size:1rem;margin:18px 0;background:#fff;">
        ${options}
      </select>
      <button class="submit-btn" style="width:100%;" onclick="saveCountryChoice()">Continue →</button>
      <p style="color:#bbb;font-size:0.78rem;margin-top:12px;">You can change this any time with the 🌍 button in the menu.</p>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay && !force) overlay.remove(); });
}

function saveCountryChoice() {
  const sel = document.getElementById('country-picker-select');
  if (!sel) return;
  localStorage.setItem('pawfinder_country', sel.value);
  localStorage.setItem('pawfinder_country_set', '1');
  location.reload();
}

function initCountryButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const btn = document.createElement('button');
  btn.className = 'dark-toggle country-btn';
  btn.textContent = _selectedCountry ? `${flagFor(_selectedCountry)} ${_selectedCountry}` : '🌍 Worldwide';
  btn.title = 'Change your country';
  btn.onclick = () => showCountryPicker(false);
  nav.appendChild(btn);
}

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initDarkMode();
  initCountryButton();
  // First visit: ask which country before anything else.
  if (!localStorage.getItem('pawfinder_country_set')) {
    showCountryPicker(true);
  }
  loadCounter();
  await loadHomePets();
  await loadBrowsePets();
  await initMap();

  initLocationPicker('location-picker-lost', 'lat-lost', 'lng-lost', 'pin-status-lost');
  initLocationPicker('location-picker-found', 'lat-found', 'lng-found', 'pin-status-found');
  setupPhotoInput('camera-btn-lost', 'photo', 'photo-preview-lost');
  setupPhotoInput('camera-btn-found', 'photo', 'photo-preview-found');

  function setupExtraPhoto(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) { preview.innerHTML = ''; return; }
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:120px;border-radius:8px;">`;
    });
  }
  setupExtraPhoto('photo2-lost', 'photo-preview2-lost');
  setupExtraPhoto('photo3-lost', 'photo-preview3-lost');
  setupExtraPhoto('photo2-found', 'photo-preview2-found');
  setupExtraPhoto('photo3-found', 'photo-preview3-found');

  subscribeToNewPets();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Pre-select the poster's country on the post forms.
  if (_selectedCountry) {
    const countrySelect = document.getElementById('country');
    if (countrySelect && [...countrySelect.options].some(o => o.value === _selectedCountry)) {
      countrySelect.value = _selectedCountry;
    }
  }

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

  const nearMe = document.getElementById('near-me');
  if (nearMe) nearMe.addEventListener('change', loadBrowsePets);
  const radiusKm = document.getElementById('radius-km');
  if (radiusKm) {
    radiusKm.addEventListener('input', () => {
      const lbl = document.getElementById('radius-label');
      if (lbl) lbl.textContent = radiusKm.value + ' km';
      if (document.getElementById('near-me')?.checked) loadBrowsePets();
    });
  }

  const sortOrder = document.getElementById('sort-order');
  if (sortOrder) sortOrder.addEventListener('change', loadBrowsePets);

  const filterSize = document.getElementById('filter-size');
  if (filterSize) filterSize.addEventListener('change', loadBrowsePets);
  const filterColor = document.getElementById('filter-color');
  if (filterColor) filterColor.addEventListener('input', loadBrowsePets);

  document.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('swatch-active'));
      btn.classList.add('swatch-active');
      loadBrowsePets();
    });
  });

  loadReunitedTicker();
});
