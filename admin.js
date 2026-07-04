const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let globalProperties = [];

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadAdminProperties();
    } else { 
        alert("Username atau Password salah!"); 
    }
});

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function loadAdminProperties() {
    const stored = localStorage.getItem('properties');
    globalProperties = stored ? JSON.parse(stored) : [];

    const container = document.getElementById('admin-properties-list');
    if(container) {
        container.innerHTML = '';
        if (globalProperties.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-8">Belum ada unit kontrakan yang di-publish.</p>`;
            return;
        }

        globalProperties.forEach(p => {
            container.innerHTML += `
                <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col gap-3 text-left">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <h3 class="font-bold text-sm text-white">${p.name}</h3>
                            <p class="text-[11px] text-indigo-300">Kategori: ${p.category}</p>
                            <p class="text-xs text-emerald-400 font-bold mt-1">Rp ${Number(p.price).toLocaleString('id-ID')} / bulan</p>
                            <p class="text-[11px] text-amber-400 font-bold mt-0.5">📸 Terupload: ${p.images ? p.images.length : 0} file foto</p>
                        </div>
                        <div class="flex gap-1.5">
                            <button onclick="window.bukaModeEdit(${p.id})" class="bg-amber-500 hover:bg-amber-600 text-slate-900 text-[11px] px-2.5 py-1 rounded font-bold transition-all">Edit</button>
                            <button onclick="window.deleteProperty(${p.id})" class="bg-red-500 hover:bg-red-600 text-white text-[11px] px-2.5 py-1 rounded font-bold transition-all">Hapus</button>
                        </div>
                    </div>

                    <div id="edit-form-${p.id}" class="hidden bg-slate-800 p-3 rounded-lg border border-slate-500 space-y-2 mt-2 text-slate-200">
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Nama Unit / Kamar:</label>
                            <input type="text" id="edit-name-${p.id}" value="${p.name}" class="w-full bg-slate-700 text-xs p-2 rounded text-white border border-slate-600 focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Harga Sewa Bulanan:</label>
                            <input type="number" id="edit-price-${p.id}" value="${p.price}" class="w-full bg-slate-700 text-xs p-2 rounded text-white border border-slate-600 focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Kategori:</label>
                            <input type="text" id="edit-category-${p.id}" value="${p.category}" class="w-full bg-slate-700 text-xs p-2 rounded text-white border border-slate-600 focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-amber-400 font-bold block mb-0.5">📤 Re-upload File Foto Baru (Kosongkan jika tidak diganti):</label>
                            <input type="file" id="edit-files-${p.id}" multiple accept="image/*" class="w-full bg-slate-700 text-xs p-1.5 rounded text-white border border-slate-600 focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Fasilitas / Deskripsi:</label>
                            <textarea id="edit-desc-${p.id}" class="w-full bg-slate-700 text-xs p-2 rounded text-white h-20 border border-slate-600 focus:outline-none">${p.desc}</textarea>
                        </div>
                        <div class="flex gap-2 justify-end pt-1">
                            <button onclick="window.batalEdit(${p.id})" class="bg-slate-600 text-xs px-3 py-1 rounded">Batal</button>
                            <button onclick="window.simpanHasilEdit(${p.id})" class="bg-emerald-600 text-white text-xs px-3 py-1 rounded font-bold">💾 Simpan Perubahan</button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-600/50 mt-1">
                        <span class="text-[11px] text-slate-400">Status Kamar:</span>
                        <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-xs rounded px-2 py-1 text-white border border-slate-500 focus:outline-none">
                            <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                            <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                        </select>
                    </div>
                </div>`;
        });
    }
}

document.getElementById('add-property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value.trim();
    const price = parseInt(document.getElementById('prop-price').value) || 0;
    const category = document.getElementById('prop-category').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();
    const fileInput = document.getElementById('prop-files');

    let base64Images = [];
    if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            const base64Str = await convertFileToBase64(fileInput.files[i]);
            base64Images.push(base64Str);
        }
    }

    const newUnit = { id: Date.now(), name, price, category, desc, images: base64Images, status: "Tersedia" };
    globalProperties.push(newUnit);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    
    document.getElementById('add-property-form').reset();
    loadAdminProperties();
    alert("Sukses! Unit kontrakan dan file foto berhasil di-publish.");
});

window.bukaModeEdit = id => document.getElementById(`edit-form-${id}`).classList.remove('hidden');
window.batalEdit = id => document.getElementById(`edit-form-${id}`).classList.add('hidden');

window.simpanHasilEdit = async function(id) {
    const namaBaru = document.getElementById(`edit-name-${id}`).value.trim();
    const hargaBaru = parseInt(document.getElementById(`edit-price-${id}`).value) || 0;
    const kategoriBaru = document.getElementById(`edit-category-${id}`).value.trim();
    const deskripsiBaru = document.getElementById(`edit-desc-${id}`).value.trim();
    const fileInputEdit = document.getElementById(`edit-files-${id}`);

    let updatedPropertiesPromises = globalProperties.map(async (p) => {
        if (p.id === id) {
            let updatedImages = p.images || [];
            if (fileInputEdit && fileInputEdit.files.length > 0) {
                updatedImages = [];
                for (let i = 0; i < fileInputEdit.files.length; i++) {
                    const base64Str = await convertFileToBase64(fileInputEdit.files[i]);
                    updatedImages.push(base64Str);
                }
            }
            return { ...p, name: namaBaru, price: hargaBaru, category: kategoriBaru, desc: deskripsiBaru, images: updatedImages };
        }
        return p;
    });

    globalProperties = await Promise.all(updatedPropertiesPromises);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    alert("Data unit dan file foto berhasil diperbarui!");
    loadAdminProperties();
};

window.updatePropertyStatus = function(id, newStatus) {
    globalProperties = globalProperties.map(p => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
};

window.deleteProperty = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus unit ini?")) {
        globalProperties = globalProperties.filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        loadAdminProperties();
    }
};
