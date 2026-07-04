const NOMOR_WA_PEMILIK = "6281381767806"; 
const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

let map;
let markerGroup;
let db;
const DEFAULT_IMG = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";

// Inisialisasi Database IndexedDB Aman Gambar Besar
const request = indexedDB.open("KontrakanMapsDB", 1);
request.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("properties")) {
        db.createObjectStore("properties", { keyPath: "id" });
    }
};
request.onsuccess = function(e) {
    db = e.target.result;
    muatDataKontrakan();
};

function muatDataKontrakan() {
    const transaction = db.transaction(["properties"], "readonly");
    const store = transaction.objectStore("properties");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        let dataKontrakan = getAll.result;
        
        // Buat data default super awal jika DB beneran kosong melompong
        if(dataKontrakan.length === 0) {
            const defaultData = [
                { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Fasilitas Standard, Kasur, Lemari", status: "Tersedia", images: [] },
                { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC Dingin, Kasur Springbed, Lemari", status: "Tersedia", images: [] }
            ];
            const txWrite = db.transaction(["properties"], "readwrite");
            const storeWrite = txWrite.objectStore("properties");
            defaultData.forEach(item => storeWrite.put(item));
            txWrite.oncomplete = () => muatDataKontrakan();
            return;
        }
        renderPetaDanList(dataKontrakan);
    };
}

function renderPetaDanList(data) {
    const mapElement = document.getElementById('map');
    if (mapElement && !map) {
        map = L.map(mapElement).setView([PERMANENT_LAT, PERMANENT_LNG], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markerGroup = L.layerGroup().addTo(map);
    } else if (markerGroup) {
        markerGroup.clearLayers();
    }

    const containerDaftar = document.getElementById('properties-list');
    if (containerDaftar) containerDaftar.innerHTML = '';

    data.forEach(unit => {
        if (markerGroup) {
            L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(markerGroup)
             .bindPopup(`<b style="color:#4f46e5;">${unit.name}</b><br><b>Rp ${Number(unit.price).toLocaleString('id-ID')}/bln</b>`);
        }

        const coverImg = (unit.images && unit.images.length > 0) ? unit.images[0] : DEFAULT_IMG;

        if (containerDaftar) {
            containerDaftar.innerHTML += `
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden text-left">
                    <div class="relative h-44 w-full bg-slate-100">
                        <img src="${coverImg}" alt="${unit.name}" class="w-full h-full object-cover">
                        <span class="absolute top-3 right-3 px-2 py-0.5 text-[10px] rounded-full font-black ${unit.status === 'Tersedia' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">${unit.status}</span>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm leading-tight line-clamp-1">${unit.name}</h3>
                            <p class="text-[10px] text-indigo-500 font-bold mt-0.5">Kategori: ${unit.category}</p>
                            <p class="text-indigo-600 font-black text-sm mt-1">Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan</p>
                            <p class="text-slate-600 text-xs mt-2 mb-3 line-clamp-2"><b>Fasilitas:</b> ${unit.desc}</p>
                        </div>
                        <div class="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                            <button onclick="bukaModalDetail(${unit.id})" class="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-xl text-center">
                                <i class="fa-solid fa-images mr-1"></i> Lihat Detail & Foto (${unit.images ? unit.images.length : 0})
                            </button>
                            <div class="flex gap-1.5">
                                <button onclick="map.setView([${PERMANENT_LAT}], [${PERMANENT_LNG}], 17)" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl">📍 Peta</button>
                                <button onclick="window.pilihUnitBooking('${unit.name}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl">📝 Sewa</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    });
}

window.bukaModalDetail = function(id) {
    const transaction = db.transaction(["properties"], "readonly");
    const store = transaction.objectStore("properties");
    const getReq = store.get(id);

    getReq.onsuccess = function() {
        const unit = getReq.result;
        if(!unit) return;

        document.getElementById('modal-title').innerText = unit.name;
        document.getElementById('modal-category').innerText = `Kategori: ${unit.category} | Status: ${unit.status}`;
        document.getElementById('modal-price').innerText = `Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan`;
        document.getElementById('modal-desc').innerText = unit.desc;

        const galleryContainer = document.getElementById('modal-gallery');
        galleryContainer.innerHTML = '';
        
        const fotoList = (unit.images && unit.images.length > 0) ? unit.images : [DEFAULT_IMG];
        fotoList.forEach(imgData => {
            galleryContainer.innerHTML += `
                <div class="bg-slate-100 rounded-lg overflow-hidden border border-slate-200 h-28 shadow-sm">
                    <img src="${imgData}" alt="Foto" class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all" onclick="window.open('${imgData}', '_blank')">
                </div>`;
        });

        document.getElementById('modal-btn-booking').onclick = function() {
            tutupModal();
            window.pilihUnitBooking(unit.name);
        };
        document.getElementById('detail-modal').classList.remove('hidden');
    };
};

window.tutupModal = function() {
    document.getElementById('detail-modal').classList.add('hidden');
};

window.pilihUnitBooking = function(namaUnit) {
    const inputUnit = document.getElementById('unit-terpilih');
    if (inputUnit) inputUnit.value = namaUnit;
    document.getElementById('form-booking').scrollIntoView({ behavior: 'smooth' });
};

document.getElementById('booking-form-wa').addEventListener('submit', function(e) {
    e.preventDefault();
    const unit = document.getElementById('unit-terpilih').value;
    const nama = document.getElementById('tenant-name').value.trim();
    const hp = document.getElementById('tenant-phone').value.trim();

    const teksWA = `Halo Pak David, saya ingin mengajukan sewa/survei kontrakan.%0A%0A` +
                   `▪️ *Unit Terpilih :* ${unit}%0A` +
                   `▪️ *Nama Penyewa :* ${nama}%0A` +
                   `▪️ *No. WhatsApp :* ${hp}%0A%0A` +
                   `Apakah unit tersebut masih tersedia? Terima kasih.`;

    window.open(`https://api.whatsapp.com/send?phone=${NOMOR_WA_PEMILIK}&text=${teksWA}`, '_blank');
});
