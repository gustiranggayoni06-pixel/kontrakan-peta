const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let adminMap, adminMarkerGroup;
let globalProperties = [];

// 🔒 KOORDINAT PERMANEN KOSAN PAK DAVID KARAWANG
const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

// 🔒 USERNAME & PASSWORD DIKUNCI DI SINI
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// 1. SISTEM LOGIN STATIS
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Pengecekan akun langsung di browser tanpa server Node
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        alert('Login Berhasil!');
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        
        initAdminMap();
        loadAdminProperties();
        loadBookings();
    } else { 
        alert("Username atau Password salah!"); 
    }
});

// 2. INISIALISASI PETA ADMIN
function initAdminMap() {
    if (!adminMap) {
        adminMap = L.map('admin-map').setView([PERMANENT_LAT, PERMANENT_LNG], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMap);
        adminMarkerGroup = L.layerGroup().addTo(adminMap);
        
        // Pin permanen lokasi Kosan Pak David
        L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(adminMap)
         .bindPopup("<b>Lokasi Permanen Terkunci</b>").openPopup();
    }
}

// 3. MEMUAT DATA PROPERTI DARI LOCALSTORAGE
function loadAdminProperties() {
    // Mengambil dari memori browser, jika kosong gunakan default Kosan Pak David
    const stored = localStorage.getItem('properties');
    if (stored) {
        globalProperties = JSON.parse(stored);
    } else {
        globalProperties = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Listrik token, wifi free", status: "Tersedia", lat: PERMANENT_LAT, lng: PERMANENT_LNG },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "AC & Kasur", desc: "AC 1/2 PK, Kasur Springbed", status: "Tersedia", lat: PERMANENT_LAT, lng: PERMANENT_LNG }
        ];
        localStorage.setItem('properties', JSON.stringify(globalProperties));
    }

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
                    <button onclick="window.deleteProperty(${p.id})" class="text-red-400 text-xs hover:text-red-300">Hapus</button>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-600/50">
                    <span class="text-[11px] text-emerald-400 font-bold">Rp ${Number(p.price).toLocaleString()}</span>
                    <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-white text-[10px] rounded px-1.5 py-0.5 focus:outline-none">
                        <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                        <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                    </select>
                </div>
            </div>`;
    });
}

// 4. TAMBAH UNIT BARU
document.getElementById('add-property-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value;
    const price = document.getElementById('prop-price').value;
    const category = document.getElementById('prop-category').value;
    const desc = document.getElementById('prop-desc').value;

    const newUnit = {
        id: Date.now(), // Generate ID unik memakai waktu
        name,
        price: parseInt(price) || 0,
        category,
        desc,
        status: "Tersedia",
        lat: PERMANENT_LAT,
        lng: PERMANENT_LNG
    };

    globalProperties.push(newUnit);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    
    document.getElementById('add-property-form').reset();
    loadAdminProperties();
    alert("Unit berhasil ditambahkan ke panel!");
});

// 5. UPDATE STATUS KOSAN
window.updatePropertyStatus = function(id, newStatus) {
    globalProperties = globalProperties.map(p => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    alert(`Status unit berhasil diubah menjadi: ${newStatus}`);
}

// 6. HAPUS UNIT
window.deleteProperty = function(id) {
    if (confirm("Hapus unit kontrakan ini?")) {
        globalProperties = globalProperties.filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        loadAdminProperties();
    }
}

// 7. MEMUAT DAFTAR BOOKING PENYEWA
function loadBookings() {
    const storedBookings = localStorage.getItem('bookings');
    const bookings = storedBookings ? JSON.parse(storedBookings) : [];
    const container = document.getElementById('admin-bookings-list');
    container.innerHTML = bookings.length === 0 ? '<p class="text-xs text-slate-500 text-center py-4">Belum ada pengajuan</p>' : '';
    
    bookings.forEach(b => {
        container.innerHTML += `
            <div class="bg-slate-700/30 border border-slate-600/50 p-2.5 rounded-xl text-[11px] space-y-1">
                <div class="flex justify-between text-[9px] text-slate-400">
                    <span class="font-bold text-emerald-400">${b.bookingId}</span>
                    <span>${b.date || ''}</span>
                </div>
                <p class="text-slate-200 font-semibold">Penyewa: ${b.tenantName}</p>
                <p class="text-slate-400">Unit: ${b.propertyName}</p>
            </div>`;
    });
}
