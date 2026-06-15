// ── DATA ─────────────────────────────────────────────────────────────────────

async function getPets() {
  if (DB_READY) {
    const { data, error } = await supabaseClient
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
  let target;
  if (DB_READY) {
    const { count, error } = await supabaseClient
      .from('pets').select('id', { count: 'exact', head: true }).eq('status', 'reunited');
    target = error ? parseInt(localStorage.getItem('pawfinder_reunited') || '10') : (count ?? 0);
  } else {
    target = parseInt(localStorage.getItem('pawfinder_reunited') || '10');
  }
  const duration = 1200;
  const startTime = performance.now();
  (function tick(now) {
    const t = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
    if (t < 1) requestAnimationFrame(tick);
  })(performance.now());
}

function initDarkMode() {
  if (localStorage.getItem('pawfinder_theme') === 'dark')
    document.documentElement.setAttribute('data-theme', 'dark');
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

// ── RENDER ───────────────────────────────────────────────────────────────────

function renderCard(pet) {
  const key = pet.id ? String(pet.id) : `local-${++_seq}`;
  petStore.set(key, pet);

  const imgSrc = pet.photo_url || pet.photo || 'https://placehold.co/300x150?text=No+Photo';
  const label = pet.type === 'lost' ? 'LOST' : 'FOUND';
  const locationLabel = pet.type === 'lost' ? 'Last seen' : 'Found at';
  const isReunited = pet.status === 'reunited';
  const phoneSafe = escHtml(pet.phone || '');
  const emailSafe = escHtml(pet.email || '');
  const phonePrivate = !!pet.phone_hidden;
  const name = escHtml(pet.pet_name || pet.petName || 'Unknown');

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
    <div class="card${isReunited ? ' card-reunited' : ''}">
      ${isReunited ? '<div class="reunited-banner">🎉 REUNITED!</div>' : ''}
      <img src="${imgSrc}" alt="${name}">
      <span class="badge-${pet.type}">${label}</span>
      <h3>${name}</h3>
      <p><strong>Animal:</strong> ${escHtml(pet.animal)} ${pet.breed ? '— ' + escHtml(pet.breed) : ''}</p>
      <p><strong>Color:</strong> ${escHtml(pet.color)}</p>
      ${pet.age ? `<p><strong>Age:</strong> ${escHtml(pet.age)}</p>` : ''}
      <p><strong>Size:</strong> ${escHtml(pet.size)}</p>
      <p><strong>${locationLabel}:</strong> ${escHtml(pet.location)}</p>
      <p><strong>Date:</strong> ${escHtml(pet.date)}</p>
      ${pet.special ? `<p><strong>Special:</strong> ${escHtml(pet.special)}</p>` : ''}
      ${pet.reward === true || pet.reward === 'yes' ? `<p style="color:#c62828;font-weight:bold;">Reward offered!</p>` : ''}
      ${contactRows}
      ${pet.lat && pet.lng ? `<a href="map.html" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:#f97316;">📍 See on map</a>` : ''}
      <div class="card-actions">
        ${phoneSafe && !phonePrivate ? `<button class="action-btn" onclick="copyPhone('${phoneSafe}',this)">📋 Copy Phone</button>` : ''}
        ${emailSafe ? `<button class="action-btn" onclick="copyEmail('${emailSafe}',this)">📋 Copy Email</button>` : ''}
        <button class="action-btn" onclick="whatsappShare('${key}')">💬 WhatsApp</button>
        <button class="action-btn" onclick="sharePost('${key}')">🔗 Share</button>
        <button class="action-btn" onclick="printFlyer('${key}')">🖨️ Print Flyer</button>
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
  const stored = parseInt(localStorage.getItem('pawfinder_reunited') || '10') + 1;
  localStorage.setItem('pawfinder_reunited', stored);
  const el = document.getElementById('reunited-count');
  if (el) el.textContent = stored;
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

  const sort = document.getElementById('sort-order')?.value || 'newest';
  if (sort === 'oldest') pets = [...pets].reverse();
  else if (sort === 'az') pets = [...pets].sort((a, b) => (a.pet_name || a.petName || '').localeCompare(b.pet_name || b.petName || ''));

  if (!pets.length) {
    container.innerHTML = '<p class="empty-state">No pets found. Try adjusting your search.</p>';
    return;
  }
  container.innerHTML = pets.map(renderCard).join('');
  pets.filter(p => p.id).forEach(p => loadTips(String(p.id)));
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
    const photoFile = form.photo.files[0];
    let photoUrl = null;
    if (photoFile) {
      photoUrl = DB_READY ? await uploadPhoto(photoFile) : await new Promise(res => {
        const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(photoFile);
      });
    }
    const phone = form.phone?.value.trim();
    const email = form.email?.value.trim();
    if (!phone && !email) {
      alert('Please provide at least a phone number or email so people can contact you.');
      btn.textContent = 'Post Lost Pet Notice'; btn.disabled = false;
      return;
    }
    const locParts = [form.location?.value, form.state?.value, form.country?.value].filter(Boolean);
    const timeSeen = form.time_seen?.value;
    await savePet({
      type: 'lost', owner_name: form.ownerName.value, phone: phone || '',
      email: email || '', phone_hidden: !!form.phone_hidden?.checked,
      pet_name: form.petName.value, animal: form.animal.value, breed: form.breed.value,
      color: form.color.value, size: form.size.value, age: form.age?.value || '', photo_url: photoUrl,
      location: locParts.join(', ') || 'Unknown',
      date: form.date.value + (timeSeen ? ' at ' + timeSeen : ''),
      special: form.special.value,
      reward: form.reward.value === 'yes',
      lat: parseFloat(form.lat.value) || null, lng: parseFloat(form.lng.value) || null,
    });
    form.reset();
    document.getElementById('pin-status-lost').textContent = 'No location selected yet.';
    document.getElementById('pin-status-lost').style.color = '#888';
    const prevLost = document.getElementById('photo-preview-lost');
    if (prevLost) prevLost.innerHTML = '';
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
    const photoFile = form.photo.files[0];
    let photoUrl = null;
    if (photoFile) {
      photoUrl = DB_READY ? await uploadPhoto(photoFile) : await new Promise(res => {
        const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(photoFile);
      });
    }
    const phone = form.phone?.value.trim();
    const email = form.email?.value.trim();
    if (!phone && !email) {
      alert('Please provide at least a phone number or email so people can contact you.');
      btn.textContent = 'Post Found Pet Notice'; btn.disabled = false;
      return;
    }
    const locParts = [form.location?.value, form.state?.value, form.country?.value].filter(Boolean);
    const timeSeen = form.time_seen?.value;
    await savePet({
      type: 'found', owner_name: form.finderName.value, phone: phone || '',
      email: email || '', phone_hidden: !!form.phone_hidden?.checked,
      pet_name: 'Unknown', animal: form.animal.value, breed: '',
      color: form.color.value, size: form.size.value, age: form.age?.value || '', photo_url: photoUrl,
      location: locParts.join(', ') || 'Unknown',
      date: form.date.value + (timeSeen ? ' at ' + timeSeen : ''),
      special: form.special.value,
      reward: false,
      lat: parseFloat(form.lat.value) || null, lng: parseFloat(form.lng.value) || null,
    });
    form.reset();
    document.getElementById('pin-status-found').textContent = 'No location selected yet.';
    document.getElementById('pin-status-found').style.color = '#888';
    const prevFound = document.getElementById('photo-preview-found');
    if (prevFound) prevFound.innerHTML = '';
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

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initDarkMode();
  loadCounter();
  await loadHomePets();
  await loadBrowsePets();
  await initMap();

  initLocationPicker('location-picker-lost', 'lat-lost', 'lng-lost', 'pin-status-lost');
  initLocationPicker('location-picker-found', 'lat-found', 'lng-found', 'pin-status-found');
  setupPhotoInput('camera-btn-lost', 'photo', 'photo-preview-lost');
  setupPhotoInput('camera-btn-found', 'photo', 'photo-preview-found');

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
});
