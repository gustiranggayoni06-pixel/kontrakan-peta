const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let globalProperties = [];

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value.trim() === ADMIN_USER && document.getElementById('password').value.trim() === ADMIN_PASS) {
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadAdminProperties();
    } else { alert("Salah akun!"); }
});

function loadAdminProperties() {
    const stored = localStorage.getItem('properties');
    globalProperties = stored ? JSON.parse(stored) : [];

    const container = document.getElementById('admin-properties-list');
    if(container) {
        container.innerHTML = '';
        globalProperties.forEach(p => {
            const imgString = p.images ? p.images.join(', ') : '';
            container.innerHTML += `
                <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col gap-3 mb-3 text-left">
                    <div class="flex justify-between items-start gap-4">
                        <div class="flex-1">
                            <h3 class="font-bold text-sm text-white">${p.name}</h3>
                            <p class="text-[11px] text-indigo-300">Total Foto: ${p.images ? p.images.length : 0} gambar</p>
                            <p class="text-xs text-emerald-400 font-bold mt-1">Rp ${Number(p.price).toLocaleString('id-ID')} / bulan</p>
                        </div>
                        <div class="flex gap-1.5">
                            <button onclick="window.bukaModeEdit(${p.id})" class="bg-amber-500 text-slate-900 text-[11px] px-2.5 py-1 rounded font-bold">🛠️ Edit</button>
                            <button onclick="window.deleteProperty(${p.id})" class="bg-red-500 text-white text-[11px] px-2.5 py-1 rounded font-bold">❌ Hapus</button>
                        </div>
                    </div>

                    <!-- FORM EDIT -->
                    <div id="edit-form-${p.id}" class="hidden bg-slate-800 p-3 rounded-lg border border-slate-500 space-y-2 mt-2">
                        <div>
                            <label class="text-[10px] text-slate-400 block">Nama Unit:</label>
                            <input type="text" id="edit-name-${p.id}" value="${p.name}" class="w-full bg-slate-700 text-xs p-2 rounded text-white focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block">Harga:</label>
                            <input type="number" id="edit-price-${p.id}" value="${p.price}" class="w-full bg-slate-700 text-xs p-2 rounded text-white focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block">Kategori:</label>
                            <input type="text" id="edit-category-${p.id}" value="${p.category}" class="w-full bg-slate-700 text-xs p-2 rounded text-white focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-indigo-400 font-bold block">Link Foto (Pisahkan dengan koma jika banyak):</label>
                            <textarea id="edit-images-${p.id}" class="w-full bg-slate-700 text-white text-[11px] p-2 rounded h-16 focus:outline-none">${imgString}</textarea>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block">Fasilitas:</label>
                            <textarea id="edit-desc-${p.id}" class="w-full bg-slate-700 text-xs p-2 rounded text-white h-16 focus:outline-none">${p.desc}</textarea>
                        </div>
                        <div class="flex gap-2 justify-end pt-1">
                            <button onclick="window.batalEdit(${p.id})" class="bg-slate-600 text-xs px-3 py-1 rounded">Batal</button>
                            <button onclick="window.simpanHasilEdit(${p.id})" class="bg-emerald-600 text-xs px-3 py-1 rounded font-bold">💾 Simpan</button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-600/50 mt-1">
                        <span class="text-[11px] text-slate-400">Status:</span>
                        <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-xs rounded px-2 py-1 text-white focus:outline-none">
                            <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                            <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                        </select>
                    </div>
                </div>`;
        });
    }
}

document.getElementById('add-property-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value.trim();
    const price = parseInt(document.getElementById('prop-price').value) || 0;
    const category = document.getElementById('prop-category').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();
    
    // Pecah link gambar yang dimasukkan menggunakan separator koma
    const rawImages = document.getElementById('prop-images').value.split(',');
    const images = rawImages.map(url => url.trim()).filter(url => url !== "");

    globalProperties.push({ id: Date.now(), name, price, category, desc, images, status: "Tersedia" });
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    document.getElementById('add-property-form').reset();
    loadAdminProperties();
    alert("Unit baru rilis!");
});

window.bukaModeEdit = id => document.getElementById(`edit-form-${id}`).classList.remove('hidden');
window.batalEdit = id => document.getElementById(`edit-form-${id}`).classList.add('hidden');

window.simpanHasilEdit = function(id) {
    const name = document.getElementById(`edit-name-${id}`).value.trim();
    const price = parseInt(document.getElementById(`edit-price-${id}`).value) || 0;
    const category = document.getElementById(`edit-category-${id}`).value.trim();
    const desc = document.getElementById(`edit-desc-${id}`).value.trim();
    
    const rawImages = document.getElementById(`edit-images-${id}`).value.split(',');
    const images = rawImages.map(url => url.trim()).filter(url => url !== "");

    globalProperties = globalProperties.map(p => p.id === id ? { ...p, name, price, category, desc, images } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    loadAdminProperties();
    alert("Berhasil disimpan!");
};

window.updatePropertyStatus = function(id, newStatus) {
    globalProperties = globalProperties.map(p => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
};

window.deleteProperty = function(id) {
    if (confirm("Hapus unit?")) {
        globalProperties = globalProperties.filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        loadAdminProperties();
    }
};
