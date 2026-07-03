// Ganti isi file admin.js Anda dengan kode di bawah ini
const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let adminMap, adminMarkerGroup;
let globalProperties = [];

// 🔒 KORDINAT PERMANEN KOSAN PAK DAVID KARAWANG
const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        
        initAdminMap();
        await loadAdminProperties();
        loadBookings();
    } else { 
        alert("Username atau Password salah!"); 
    }
});

function initAdminMap() {
    if (!adminMap) {
        // Peta langsung dikunci ke posisi permanen
        adminMap = L.map('admin-map').setView([PERMANENT_LAT, PERMANENT_LNG], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMap);
        adminMarkerGroup = L.layerGroup().addTo(adminMap);
        
        // Tancapkan satu pin permanen di peta admin
        L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(adminMap)
         .bindPopup("<b>Lokasi Permanen Terkunci</b>").openPopup();
    }
}

async function loadAdminProperties() {
    const res = await fetch('/api/properties');
    globalProperties = await res.json();
    const container = document.getElementById('admin-properties-list');
    container.innerHTML = '';
    
    adminMarkerGroup.clearLayers();
    
    globalProperties.forEach(p => {
        if (p.lat && p.lng) {
            L.marker([p.lat, p.lng]).addTo(adminMarkerGroup);
        }

        container.innerHTML += `
            <div class="bg-slate-700/50 p-3 rounded-xl border border-slate-600 flex flex-col justify-between gap-2">
                <div class="flex justify-between items-start">
                    <div class="truncate">
                        <p class="font-bold text-xs text-white">${p.name}</p>
                        <p class="text-[10px] text-indigo-400">Lokasi Terpasang Otomatis</p>
                    </div>
                    <button onclick="window.deleteProperty(${p.id})" class="text-red-400 text-xs hover:text-red-300"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-600/50">
                    <span class="text-[11px] text-emerald-400 font-bold">Rp ${p.price.toLocaleString()}</span>
                    <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-white text-[10px] rounded px-1.5 py-0.5 focus:outline-none">
                        <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                        <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                    </select>
                </div>
            </div>`;
    });
}

document.getElementById('add-property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value;
    const price = document.getElementById('prop-price').value;
    const category = document.getElementById('prop-category').value;
    const desc = document.getElementById('prop-desc').value;

    // 🌟 Mengirim data dengan Lat & Lng permanen tanpa menyuruh admin isi lagi
    const res = await fetch('/api/properties/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            price, 
            category, 
            desc, 
            lat: PERMANENT_LAT, 
            lng: PERMANENT_LNG 
        })
    });
    
    if(res.ok) {
        document.getElementById('add-property-form').reset();
        await loadAdminProperties();
    } else {
        alert("Gagal menambahkan unit!");
    }
});

window.updatePropertyStatus = async function(id, newStatus) {
    await fetch(`/api/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
}

window.deleteProperty = async function(id) {
    if (confirm("Hapus unit kontrakan ini?")) {
        await fetch(`/api/properties/${id}`, { method: 'DELETE' });
        loadAdminProperties();
    }
}

async function loadBookings() {
    const res = await fetch('/api/admin/bookings');
    const bookings = await res.json();
    const container = document.getElementById('admin-bookings-list');
    container.innerHTML = bookings.length === 0 ? '<p class="text-xs text-slate-500 text-center py-4">Belum ada pengajuan</p>' : '';
    
    bookings.forEach(b => {
        container.innerHTML += `
            <div class="bg-slate-700/30 border border-slate-600/50 p-2.5 rounded-xl text-[11px] space-y-1">
                <div class="flex justify-between text-[9px] text-slate-400">
                    <span class="font-bold text-emerald-400">${b.bookingId}</span>
                    <span>${b.date}</span>
                </div>
                <p class="text-slate-200 font-semibold">Penyewa: ${b.tenantName}</p>
                <p class="text-slate-400">Unit: ${b.propertyName}</p>
            </div>`;
    });
}