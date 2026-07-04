const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let adminMap;
let globalProperties = [];

// 🔒 KOORDINAT UTAMA KOSAN PAK DAVID KARAWANG
const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

// 🔒 PENGATURAN AKUN ADMIN (Silakan ganti sesuai keinginan)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// === 1. SISTEM LOGIN ===
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        alert('Login Berhasil! Selamat Datang Penguasa Web.');
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        
        initAdminMap();
        loadAdminProperties();
    } else { 
        alert("Username atau Password salah!"); 
    }
});

// === 2. INISIALISASI PETA ADMIN ===
function initAdminMap() {
    if (!adminMap) {
        adminMap = L.map('admin-map').setView([PERMANENT_LAT, PERMANENT_LNG], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMap);
        
        // Pin utama lokasi Kosan Pak David
        L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(adminMap)
         .bindPopup("<b>Kosan Pak David (Pusat)</b>").openPopup();
    }
}

// === 3. TAMPILKAN & MUAT DATA (READ) ===
function loadAdminProperties() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        globalProperties = JSON.parse(stored);
    } else {
        // Data awal jika database kosong
        globalProperties = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Listrik token, wifi free, air lancar", status: "Tersedia" },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC 1/2 PK, Kasur Springbed, Lemari", status: "Tersedia" }
        ];
        localStorage.setItem('properties', JSON.stringify(globalProperties));
    }

    const container = document.getElementById('admin-properties-list');
    container.innerHTML = '';
    
    globalProperties.forEach(p => {
        container.innerHTML += `
            <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col justify-between gap-3">
                <div>
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="font-bold text-sm text-white truncate w-40">${p.name}</h3>
                        <button onclick="window.deleteProperty(${p.id})" class="text-red-400 text-xs hover:text-red-300 font-semibold">
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </div>
                    <p class="text-[11px] text-indigo-400 mb-1">Kategori: ${p.category}</p>
                    <p class="text-[11px] text-slate-300 line-clamp-2">${p.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-600/50">
                    <span class="text-xs text-emerald-400 font-bold">Rp ${Number(p.price).toLocaleString('id-ID')}</span>
                    <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-white text-xs rounded px-2 py-1 focus:outline-none border border-slate-500">
                        <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                        <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                    </select>
                </div>
            </div>`;
    });
}

// === 4. FITUR TAMBAH DATA (CREATE) ===
document.getElementById('add-property-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value;
    const price = document.getElementById('prop-price').value;
    const category = document.getElementById('prop-category').value;
    const desc = document.getElementById('prop-desc').value;

    const newUnit = {
        id: Date.now(), // ID Unik otomatis berbasis waktu mikro
        name,
        price: parseInt(price) || 0,
        category,
        desc,
        status: "Tersedia"
    };

    globalProperties.push(newUnit);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    
    document.getElementById('add-property-form').reset();
    loadAdminProperties();
    alert("Unit baru sukses ditambahkan dan langsung aktif!");
});

// === 5. FITUR EDIT STATUS (UPDATE) ===
window.updatePropertyStatus = function(id, newStatus) {
    globalProperties = globalProperties.map(p => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    alert(`Status kamar berhasil diubah menjadi: ${newStatus}`);
};

// === 6. FITUR HAPUS DATA (DELETE) ===
window.deleteProperty = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus unit kontrakan ini secara permanen?")) {
        globalProperties = globalProperties.filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        loadAdminProperties();
        alert("Unit berhasil dimusnahkan!");
    }
};
