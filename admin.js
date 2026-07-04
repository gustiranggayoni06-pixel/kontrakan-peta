document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBox = document.getElementById('login-box');
    const dashboard = document.getElementById('admin-dashboard');
    const addForm = document.getElementById('add-property-form');
    const fileInput = document.getElementById('prop-files');
    const previewContainer = document.getElementById('preview-foto');
    const listContainer = document.getElementById('admin-properties-list');

    let properties = JSON.parse(localStorage.getItem('kontrakanData')) || [];
    let tempImages = []; // Nampung foto base64 sementara

    // LOGIN
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        if (user === 'admin' && pass === '123') { // GANTI PASSWORD LU DISINI
            loginBox.classList.add('hidden');
            dashboard.classList.remove('hidden');
            renderList();
        } else {
            alert('Username / Password salah bang!');
        }
    });

    // PREVIEW FOTO PAS PILIH FILE
    fileInput.addEventListener('change', async () => {
        previewContainer.innerHTML = '';
        tempImages = [];
        
        for (const file of fileInput.files) {
            const base64 = await toBase64(file);
            tempImages.push(base64);
            
            const img = document.createElement('img');
            img.src = base64;
            img.className = 'w-16 h-16 object-cover rounded-lg border border-slate-600';
            previewContainer.appendChild(img);
        }
    });

    // SUBMIT FORM TAMBAH UNIT
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (tempImages.length === 0) return alert('Upload minimal 1 foto bang');

        const newUnit = {
            id: Date.now(),
            name: document.getElementById('prop-name').value,
            price: document.getElementById('prop-price').value,
            category: document.getElementById('prop-category').value,
            desc: document.getElementById('prop-desc').value,
            images: tempImages
        };

        properties.unshift(newUnit); // Biar yg baru di atas
        localStorage.setItem('kontrakanData', JSON.stringify(properties));
        
        addForm.reset();
        previewContainer.innerHTML = '';
        tempImages = [];
        renderList();
        alert('Unit berhasil dipublish!');
    });

    // RENDER LIST UNIT
    function renderList() {
        listContainer.innerHTML = '';
        if (properties.length === 0) {
            listContainer.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Belum ada unit. Tambah dulu di kiri bang.</p>';
            return;
        }

        properties.forEach(prop => {
            const item = document.createElement('div');
            item.className = 'bg-slate-700/50 p-3 rounded-xl border border-slate-700 flex gap-3';
            item.innerHTML = `
                <img src="${prop.images[0]}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h3 class="text-sm font-bold text-white truncate">${prop.name}</h3>
                        <button onclick="hapusUnit(${prop.id})" class="text-rose-500 hover:text-rose-400 ml-2">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                    <p class="text-xs text-emerald-400 font-semibold">Rp ${Number(prop.price).toLocaleString('id-ID')}/bulan</p>
                    <p class="text- text-slate-400">${prop.category}</p>
                    <p class="text- text-slate-300 mt-1">${prop.images.length} Foto • ${prop.desc.substring(0, 50)}...</p>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    // FUNGSI HAPUS - taro di global biar bisa dipanggil onclick
    window.hapusUnit = (id) => {
        if (confirm('Yakin mau hapus unit ini?')) {
            properties = properties.filter(p => p.id !== id);
            localStorage.setItem('kontrakanData', JSON.stringify(properties));
            renderList();
        }
    };

    // HELPER: FILE KE BASE64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    renderList();
});
