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
        alert('Login Berhasil!');
        loginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadAdminProperties();
    } else { 
        alert("Username atau Password salah!"); 
    }
});

// Fungsi pembantu untuk mengubah file gambar menjadi data Teks (Base64)
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
    if (stored) {
        globalProperties = JSON.parse(stored);
    } else {
        globalProperties = [];
        localStorage.setItem('properties', JSON.stringify(globalProperties));
    }

    const container = document.getElementById('admin-properties-list');
    if(container) {
        container.innerHTML = '';
        globalProperties.forEach(p => {
            container.innerHTML += `
                <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col gap-3 mb-3 text-left">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <h3 class="font-bold text-sm text-white">${p.name}</h3>
                            <p class="text-[11px] text-indigo-300">Kategori: ${p.category}</p>
                            <p class="text-[11px] text-emerald-400 font-bold mt-1">Rp ${Number(p.price).toLocaleString('id-ID')} / bulan</p>
                            <p class="text-[11px] text-amber-400 mt-0.5">📸 Total Foto: ${p.images ? p.images.length : 0} gambar</p>
                        </div>
                        <div class="flex gap-1.5">
                            <button onclick="window.bukaModeEdit(${p.id})" class="bg-amber-500 hover:bg-amber-600 text-slate-900 text-[11px] px-2.5 py-1 rounded font-bold transition-all">🛠️ Edit</button>
                            <button onclick="window.deleteProperty(${p.id})" class="bg-red-500 hover:bg-red-600 text-white text-[11px] px-2.5 py-1 rounded font-bold transition-all">❌ Hapus</button>
                        </div>
                    </div>

                    <div id="edit-form-${p.id}" class="hidden bg-slate-800 p-3 rounded-lg border border-slate-500 space-y-2 mt-2">
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Nama Kamar / Unit:</label>
                            <input type="text" id="edit-name-${p.id}" value="${p.name}" class="w-full bg-slate-700 text-white text-xs p-2 rounded border border-slate-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Harga Sewa Bulanan:</label>
                            <input type="number" id="edit-price-${p.id}" value="${p.price}" class="w-full bg-slate-700 text-white text-xs p-2 rounded border border-slate-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Kategori:</label>
                            <input type="text" id="edit-category-${p.id}" value="${p.category}" class="w-full bg-slate-700 text-white text-xs p-2 rounded border border-slate-500 focus:outline-none">
                        </div>
                        
                        <div>
                            <label class="text-[10px] text-amber-400 font-bold block mb-0.5">📤 Upload Foto Baru (Bisa pilih banyak foto, kosongkan jika tak ingin ganti):</label>
                            <input type="file" id="edit-files-${p.id}" multiple accept="image/*" class="w-full bg-slate-700 text-white text-xs p-1 rounded border border-slate-500 focus:outline-none">
                        </div>

                        <div>
                            <label class="text-[10px] text-slate-400 block mb-0.5">Fasilitas / Deskripsi:</label>
                            <textarea id="edit-desc-${p.id}" class="w-full bg-slate-700 text-white text-xs p-2 rounded border border-slate-500 h-16 focus:outline-none">${p.desc}</textarea>
                        </div>
                        <div class="flex gap-2 justify-end pt-1">
                            <button onclick="window.batalEdit(${p.id})" class="bg-slate-600 text-white text-xs px-3 py-1 rounded shadow">Batal</button>
                            <button onclick="window.simpanHasilEdit(${p.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded font-bold shadow">💾 Simpan Perubahan</button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-600/50 mt-1">
                        <span class="text-[11px] text-slate-400">Status Kamar Saat Ini:</span>
                        <select onchange="window.updatePropertyStatus(${p.id}, this.value)" class="bg-slate-600 text-white text-xs rounded px-2 py-1 focus:outline-none border border-slate-500">
                            <option value="Tersedia" ${p.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                            <option value="Penuh" ${p.status === 'Penuh' ? 'selected' : ''}>Penuh</option>
                        </select>
                    </div>
                </div>`;
        });
    }
}

// === HANDLER PUBLISH UNIT BARU (TERMASUK MULTI UPLOAD FOTO) ===
document.getElementById('add-property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prop-name').value.trim();
    const price = parseInt(document.getElementById('prop-price').value) || 0;
    const category = document.getElementById('prop-category').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();
    const fileInput = document.getElementById('prop-files');

    let base64Images = [];
    
    // Memproses konversi file gambar ke string teks
    if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            try {
                const base64Str = await convertFileToBase64(fileInput.files[i]);
                base64Images.push(base64Str);
            } catch (err) {
                console.error("Gagal membaca file gambar", err);
            }
        }
    }

    const newUnit = {
        id: Date.now(),
        name,
        price,
        category,
        desc,
        images: base64Images, // Array penampung file foto hasil upload
        status: "Tersedia"
    };

    globalProperties.push(newUnit);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    document.getElementById('add-property-form').reset();
    loadAdminProperties();
    alert("Unit baru beserta seluruh foto berhasil di-publish!");
});

window.bukaModeEdit = function(id) {
    document.getElementById(`edit-form-${id}`).classList.remove('hidden');
};

window.batalEdit = function(id) {
    document.getElementById(`edit-form-${id}`).classList.add('hidden');
};

// === SIMPAN PERUBAHAN EDIT DATA DAN FOTO ===
window.simpanHasilEdit = async function(id) {
    const namaBaru = document.getElementById(`edit-name-${id}`).value.trim();
    const hargaBaru = parseInt(document.getElementById(`edit-price-${id}`).value) || 0;
    const kategoriBaru = document.getElementById(`edit-category-${id}`).value.trim();
    const deskripsiBaru = document.getElementById(`edit-desc-${id}`).value.trim();
    const fileInputEdit = document.getElementById(`edit-files-${id}`);

    globalProperties = globalProperties.map(async (p) => {
        if (p.id === id) {
            let updatedImages = p.images || [];
            
            // Jika admin memasukkan/mengupload file foto baru saat edit
            if (fileInputEdit && fileInputEdit.files.length > 0) {
                updatedImages = []; // reset foto lama
                for (let i = 0; i < fileInputEdit.files.length; i++) {
                    const base64Str = await convertFileToBase64(fileInputEdit.files[i]);
                    updatedImages.push(base64Str);
                }
            }

            return { ...p, name: namaBaru, price: hargaBaru, category: kategoriBaru, desc: deskripsiBaru, images: updatedImages };
        }
        return p;
    });

    // Menunggu seluruh proses enkripsi data gambar selesai
    Promise.all(globalProperties).then(resultData => {
        globalProperties = resultData;
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        alert("Sukses! Perubahan data & foto berhasil diperbarui.");
        loadAdminProperties();
    });
};

window.updatePropertyStatus = function(id, newStatus) {
    globalProperties = globalProperties.map(p => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('properties', JSON.stringify(globalProperties));
    alert(`Status kamar berhasil diubah!`);
};

window.deleteProperty = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus unit ini secara permanen?")) {
        globalProperties = globalProperties.filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(globalProperties));
        loadAdminProperties();
        alert("Unit kontrakan berhasil dihapus!");
    }
};
