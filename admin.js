const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let globalProperties = [];

const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

// 🔒 AKUN ADMIN UTAMA
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        alert('Login Berhasil! Akses Penguasa Diaktifkan.');
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadAdminProperties();
    } else { 
        alert("Username atau Password salah!"); 
    }
});

// === FITUR TAMPILKAN DATA (READ) ===
function loadAdminProperties() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        globalProperties = JSON.parse(stored);
    } else {
        globalProperties = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi", status: "Tersedia" },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi", status: "Tersedia" }
        ];
        localStorage.setItem('properties', JSON.stringify(globalProperties));
    }

    const container = document.getElementById('admin-properties-list');
    if(container) {
        container.innerHTML = '';
        globalProperties.forEach(p => {
            container.innerHTML += `
                <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col justify-between gap-3">
                    <div>
                        <div class="flex justify-between items-start">
                            <h3 id="display-name-${p.id}" class="font-bold text-sm text-white truncate w-40">${p.name}</h3>
                            <div class="flex gap-2">
                                <button onclick="window.bukaModeEdit(${p.id})" class="text-amber-400 text-xs hover:text-amber-300 font-bold">🛠️ Edit</button>
                                <button onclick="window.deleteProperty(${p.id})" class="text-red-400 text-xs hover:text-red-300 font-bold">❌ Hapus</button>
                            </div>
                        </div>
                        <p id="display-category-${p.id}" class="text-[11px] text-indigo-300 mt-0.5">Kategori: ${p.category}</p>
                        <p id="display-desc-${p.id}" class="text-[11px] text-slate-300 mt-1 line-clamp-2">${p.desc}</p>
                        
                        <div id="edit-form-${p.id}" class="hidden mt-3 bg-slate-800 p-3 rounded-lg border border-slate-500 space-y-2">
                            <input type="text" id="edit-name-${p.id}" value="${p.name}" class="w-full bg-slate-700 text-white text-xs p-1.5 rounded border border-slate-500">
                            <input type="number" id="edit-price-${p.id}" value="${p.price}" class="w-full bg-slate-700 text-white text-xs p-1.5 rounded border border-slate-500">
                            <input type="text" id="edit-category-${p.id}" value="${p.category}" class="w-full bg-slate-700 text-white text-xs p-1.5 rounded border border-slate-500">
                            <textarea id="edit-desc-${p.id}" class="w-full bg-slate-700 text-white text-xs p-1.5 rounded border border-slate-500 h-14">${p.desc}</textarea>
                            <div class="flex gap-1.5 justify-end">
                                <button onclick="window.batalEdit(${p.id})" class="bg-slate-600 text-white text-[10px] px-2 py-1 rounded">Batal</button>
                                <button onclick="window.simpanHasilEdit(${p.id})" class="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold">Simpan</button>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-600/50">
                        <span id="display-price-${p.id}" class="text-xs text-emerald-400 font-bold">Rp ${Number(p.price).toLocaleString('id-ID')}</span>
                        <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-white text-xs rounded px-2 py-1 focus:outline-none">
                            <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                            <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                        </select>
                    </div>
                </div>`;
        });
    }
}

// === FITUR TAMBAH DATA (CREATE) ===
document.getElementById('add-property-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value;
    const price = document.getElementById('prop-price').value;
    const category = document.getElementById('prop-category').value;
    const desc = document.getElementById('prop-desc').value;

    const newUnit = {
        id: Date.now(),
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
    alert("Unit baru berhasil dipublish!");
});

// === 🛠️ FITUR EDIT TOTAL (UPDATE NAMA, HARGA, DLL) ===
window.bukaModeEdit = function(id) {
    document.getElementById(`edit-form-${id}`).classList.remove('hidden');
};

window.batalEdit = function(id) {
    document.getElementById(`edit-form-${id}`).classList.add('hidden');
};

window.simpanHasilEdit = function(id) {
    const namaBaru = document.getElementById(`edit-name-${id}`).value;
    const hargaBaru = document.getElementById(`edit-price-${id}`).value;
    const kategoriBaru = document.getElementById(`edit-category-${id}`).value;
    const deskripsiBaru = document.getElementById(`edit-desc-${id}`).value;

    globalProperties = globalProperties.map(p => {
        if (p.id === id) {
            return {
                ...p,
                name: namaBaru,
                price: parseInt(hargaBaru) || 0,
                category: kategoriBaru,
                desc: deskripsiBaru
            };
        }
        return p;
    });

    localStorage.setItem('properties', JSON.stringify(globalProperties));
    alert("Perubahan unit sukses disimpan!");
    loadAdminProperties(); // Muat ulang tampilan data
};

// === 🔄 FITUR UPDATE STATUS CEPAT ===
window.updatePropertyStatus = function(id, newStatus) {
    globalProperties = globalProperties.map(p => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    alert(`Status kamar berhasil diperbarui!`);
};

// === ❌ FITUR HAPUS DATA (DELETE) ===
window.deleteProperty = function(id) {
    if (confirm("Hapus unit ini dari website secara permanen?")) {
        globalProperties = globalProperties.filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        loadAdminProperties();
        alert("Unit berhasil dihapus!");
    }
};
