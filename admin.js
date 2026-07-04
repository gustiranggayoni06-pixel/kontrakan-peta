const loginBox = document.getElementById('login-box');
const adminDashboard = document.getElementById('admin-dashboard');
let db;

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Konek Ke Engine DB Gambar Berkapasitas Besar
const request = indexedDB.open("KontrakanMapsDB", 1);
request.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("properties")) {
        db.createObjectStore("properties", { keyPath: "id" });
    }
};
request.onsuccess = function(e) {
    db = e.target.result;
};

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value.trim() === ADMIN_USER && document.getElementById('password').value.trim() === ADMIN_PASS) {
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadAdminProperties();
    } else { alert("Akun Salah!"); }
});

// Helper Mengubah File Upload Jadi Teks Base64 String Aman
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function loadAdminProperties() {
    const transaction = db.transaction(["properties"], "readonly");
    const store = transaction.objectStore("properties");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        const listData = getAll.result;
        const container = document.getElementById('admin-properties-list');
        if(!container) return;
        container.innerHTML = '';

        listData.forEach(p => {
            container.innerHTML += `
                <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col gap-3 mb-3 text-left">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <h3 class="font-bold text-sm text-white">${p.name}</h3>
                            <p class="text-[11px] text-indigo-300">Total Foto Terupload: ${p.images ? p.images.length : 0} file gambar</p>
                            <p class="text-xs text-emerald-400 font-bold mt-1">Rp ${Number(p.price).toLocaleString('id-ID')} / bulan</p>
                        </div>
                        <div class="flex gap-1.5">
                            <button onclick="window.bukaModeEdit(${p.id})" class="bg-amber-500 text-slate-900 text-[11px] px-2.5 py-1 rounded font-bold">🛠️ Edit</button>
                            <button onclick="window.deleteProperty(${p.id})" class="bg-red-500 text-white text-[11px] px-2.5 py-1 rounded font-bold">❌ Hapus</button>
                        </div>
                    </div>

                    <!-- FORM EDIT LENGKAP -->
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
                            <label class="text-[10px] text-amber-400 font-bold block">Re-upload File Foto Baru (Biarkan kosong jika tidak ingin ganti foto):</label>
                            <input type="file" id="edit-files-${p.id}" multiple accept="image/*" class="w-full bg-slate-700 text-xs p-1.5 rounded text-white focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block">Fasilitas:</label>
                            <textarea id="edit-desc-${p.id}" class="w-full bg-slate-700 text-xs p-2 rounded text-white h-16 focus:outline-none">${p.desc}</textarea>
                        </div>
                        <div class="flex gap-2 justify-end pt-1">
                            <button onclick="window.batalEdit(${p.id})" class="bg-slate-600 text-xs px-3 py-1 rounded">Batal</button>
                            <button onclick="window.simpanHasilEdit(${p.id})" class="bg-emerald-600 text-xs px-3 py-1 rounded font-bold">💾 Simpan Perubahan</button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-600/50 mt-1">
                        <span class="text-[11px] text-slate-400">Status Kamar:</span>
                        <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-xs rounded px-2 py-1 text-white focus:outline-none">
                            <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                            <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                        </select>
                    </div>
                </div>`;
        });
    };
}

// Handler Submit Tambah Unit dengan File Upload
document.getElementById('add-property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value.trim();
    const price = parseInt(document.getElementById('prop-price').value) || 0;
    const category = document.getElementById('prop-category').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();
    const fileInput = document.getElementById('prop-files');

    let images = [];
    if (fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            const base64Str = await fileToBase64(fileInput.files[i]);
            images.push(base64Str);
        }
    }

    const newUnit = { id: Date.now(), name, price, category, desc, images, status: "Tersedia" };
    
    const tx = db.transaction(["properties"], "readwrite");
    tx.objectStore("properties").put(newUnit);
    tx.oncomplete = () => {
        document.getElementById('add-property-form').reset();
        loadAdminProperties();
        alert("Sukses! Unit & seluruh file foto berhasil dipublish.");
    };
});

window.bukaModeEdit = id => document.getElementById(`edit-form-${id}`).classList.remove('hidden');
window.batalEdit = id => document.getElementById(`edit-form-${id}`).classList.add('hidden');

// Handler Simpan Hasil Edit (Bisa Edit Keterangan & Upload Ulang Foto Baru)
window.simpanHasilEdit = async function(id) {
    const txRead = db.transaction(["properties"], "readonly");
    const storeRead = txRead.objectStore("properties");
    const getReq = storeRead.get(id);

    getReq.onsuccess = async function() {
        let currentData = getReq.result;
        if(!currentData) return;

        currentData.name = document.getElementById(`edit-name-${id}`).value.trim();
        currentData.price = parseInt(document.getElementById(`edit-price-${id}`).value) || 0;
        currentData.category = document.getElementById(`edit-category-${id}`).value.trim();
        currentData.desc = document.getElementById(`edit-desc-${id}`).value.trim();

        const fileInput = document.getElementById(`edit-files-${id}`);
        if(fileInput && fileInput.files.length > 0) {
            let newImages = [];
            for (let i = 0; i < fileInput.files.length; i++) {
                const base64Str = await fileToBase64(fileInput.files[i]);
                newImages.push(base64Str);
            }
            currentData.images = newImages; // Ganti foto lama dengan yang baru diupload
        }

        const txWrite = db.transaction(["properties"], "readwrite");
        txWrite.objectStore("properties").put(currentData);
        txWrite.oncomplete = () => {
            alert("Perubahan unit dan foto berhasil disimpan!");
            loadAdminProperties();
        };
    };
};

window.updatePropertyStatus = function(id, newStatus) {
    const txRead = db.transaction(["properties"], "readonly");
    const storeRead = txRead.objectStore("properties");
    const getReq = storeRead.get(id);

    getReq.onsuccess = function() {
        let data = getReq.result;
        if(data) {
            data.status = newStatus;
            const txWrite = db.transaction(["properties"], "readwrite");
            txWrite.objectStore("properties").put(data);
        }
    };
};

window.deleteProperty = function(id) {
    if (confirm("Hapus unit ini permanen?")) {
        const tx = db.transaction(["properties"], "readwrite");
        tx.objectStore("properties").delete(id);
        tx.oncomplete = () => loadAdminProperties();
    }
};
