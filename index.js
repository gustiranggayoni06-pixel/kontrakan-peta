// 🔒 KOORDINAT UTAMA KOSAN PAK DAVID KARAWANG
const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

let map;
let markerGroup;
let dataKontrakan = [];

// Fungsi memuat data secara dinamis dari kendali admin (localStorage)
function muatDataKontrakan() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        dataKontrakan = JSON.parse(stored);
    } else {
        // Otomatis membuat data default jika database browser masih kosong melompong
        dataKontrakan = [
            {
                id: 1,
                name: "Kosan Pak David - Kamar Standard",
                price: 550000,
                category: "Kamar Mandi Dalam",
                desc: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi",
                status: "Tersedia"
            },
            {
                id: 2,
                name: "Kosan Pak David - Kamar Ber-AC",
                price: 600000,
                category: "Fasilitas AC",
                desc: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi",
                status: "Tersedia"
            }
        ];
        localStorage.setItem('properties', JSON.stringify(dataKontrakan));
    }

    renderPetaDanList();
}

function renderPetaDanList() {
    // 1. Inisialisasi Peta Leaflet jika belum ada
    if (!map) {
        map = L.map('map').setView([PERMANENT_LAT, PERMANENT_LNG], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        markerGroup = L.layerGroup().addTo(map);
    } else {
        markerGroup.clearLayers();
    }

    // 2. Tampilkan ke List Kartu & Pin Peta
    const containerDaftar = document.getElementById('daftar-kontrakan') || document.getElementById('properties-list');
    if (containerDaftar) {
        containerDaftar.innerHTML = '';
    }

    dataKontrakan.forEach(unit => {
        // Tancapkan Pin ke Peta
        const marker = L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(markerGroup);
        marker.bindPopup(`
            <div class="p-1">
                <h3 class="font-bold text-indigo-600 text-sm">${unit.name}</h3>
                <p class="text-xs font-bold text-green-600 mt-0.5">Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan</p>
                <p class="text-[11px] text-gray-500 my-1">${unit.desc}</p>
                <span class="px-1.5 py-0.5 text-[10px] rounded font-bold ${unit.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${unit.status}</span>
            </div>
        `);

        // Tampilkan Kartu Informasi di bawah peta
        if (containerDaftar) {
            containerDaftar.innerHTML += `
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-gray-800 text-base leading-snug truncate w-48">${unit.name}</h3>
                            <span class="px-2 py-0.5 text-[10px] rounded-full font-extrabold ${unit.status === 'Tersedia' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">${unit.status}</span>
                        </div>
                        <p class="text-indigo-600 font-extrabold text-sm mt-1">Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan</p>
                        <p class="text-gray-600 text-xs mt-2 mb-4 leading-relaxed">✨ <b>Fasilitas:</b> ${unit.desc}</p>
                    </div>
                    <div class="flex gap-2 mt-auto">
                        <button onclick="map.setView([${PERMANENT_LAT}], [${PERMANENT_LNG}], 17)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors">
                            Lihat Peta
                        </button>
                        <button onclick="document.getElementById('unit-terpilih').value='${unit.name}'; document.getElementById('form-booking').scrollIntoView({behavior:'smooth'})" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                            Sewa & Survei
                        </button>
                    </div>
                </div>`;
        }
    });
}

// Jalankan otomatis saat halaman terbuka
document.addEventListener('DOMContentLoaded', muatDataKontrakan);
