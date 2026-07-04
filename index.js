const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

let map;
let markerGroup;
let dataKontrakan = [];

// Membaca data yang diatur dari panel admin secara berkala
function muatDataKontrakan() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        dataKontrakan = JSON.parse(stored);
    } else {
        // Fallback default jika LocalStorage kosong
        dataKontrakan = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi", status: "Tersedia" },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi", status: "Tersedia" }
        ];
        localStorage.setItem('properties', JSON.stringify(dataKontrakan));
    }
    renderPetaDanList();
}

function renderPetaDanList() {
    // Inisialisasi Peta Leaflet secara aman
    const mapElement = document.getElementById('map') || document.getElementById('admin-map');
    if (mapElement && !map) {
        map = L.map(mapElement).setView([PERMANENT_LAT, PERMANENT_LNG], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        markerGroup = L.layerGroup().addTo(map);
    } else if (markerGroup) {
        markerGroup.clearLayers();
    }

    // Menargetkan kontainer list kartu rekomendasi kontrakan
    const containerDaftar = document.getElementById('daftar-kontrakan') || document.getElementById('properties-list') || document.querySelector('.grid');
    if (containerDaftar) {
        containerDaftar.innerHTML = '';
    }

    dataKontrakan.forEach(unit => {
        // Pasang Pin Marker di Peta
        if (markerGroup) {
            const marker = L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(markerGroup);
            marker.bindPopup(`
                <div style="color: #333; font-family: sans-serif;">
                    <strong style="color: #4f46e5;">${unit.name}</strong><br>
                    <span style="color: #16a34a; font-weight: bold;">Rp ${Number(unit.price).toLocaleString('id-ID')}/bln</span>
                </div>
            `);
        }

        // Render Kartu Informasi ke HTML
        if (containerDaftar) {
            containerDaftar.innerHTML += `
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between mb-4" style="color: #333; text-align: left;">
                    <div>
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="font-bold text-gray-800 text-base leading-tight">${unit.name}</h3>
                            <span class="px-2.5 py-0.5 text-[10px] rounded-full font-black tracking-wide ${unit.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${unit.status}</span>
                        </div>
                        <p class="text-xs text-indigo-500 font-semibold mt-1">Kategori: ${unit.category}</p>
                        <p class="text-indigo-600 font-black text-base mt-2">Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan</p>
                        <p class="text-gray-600 text-xs mt-3 mb-4 leading-relaxed"><b>Fasilitas:</b> ${unit.desc}</p>
                    </div>
                    <div class="flex gap-2 border-t border-gray-100 pt-3">
                        <button onclick="map.setView([${PERMANENT_LAT}], [${PERMANENT_LNG}], 17)" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-xl transition-all">
                            📍 Lihat Peta
                        </button>
                        <button onclick="window.pilihUnitBooking('${unit.name}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm shadow-indigo-200">
                            📝 Sewa & Survei
                        </button>
                    </div>
                </div>`;
        }
    });
}

// Fungsi otomatisasi pemindahan nama unit ke dalam form booking
window.pilihUnitBooking = function(namaUnit) {
    const inputUnit = document.getElementById('unit-terpilih') || document.querySelector('input[placeholder*="Sewa"]');
    const formBooking = document.getElementById('form-booking') || document.querySelector('form');
    if (inputUnit) {
        inputUnit.value = namaUnit;
    }
    if (formBooking) {
        formBooking.scrollIntoView({ behavior: 'smooth' });
    }
};

document.addEventListener('DOMContentLoaded', muatDataKontrakan);
