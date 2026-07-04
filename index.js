const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

let map;
let markerGroup;
let dataKontrakan = [];

function muatDataKontrakan() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        dataKontrakan = JSON.parse(stored);
    } else {
        dataKontrakan = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi", status: "Tersedia" },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi", status: "Tersedia" }
        ];
        localStorage.setItem('properties', JSON.stringify(dataKontrakan));
    }
    renderPetaDanList();
}

function renderPetaDanList() {
    // Jalankan peta Leaflet ke elemen ID 'map' atau 'admin-map' yang tersedia
    const mapElement = document.getElementById('map') || document.getElementById('admin-map');
    if (mapElement && !map) {
        map = L.map(mapElement).setView([PERMANENT_LAT, PERMANENT_LNG], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markerGroup = L.layerGroup().addTo(map);
    } else if (markerGroup) {
        markerGroup.clearLayers();
    }

    // Cari ID kontainer kartu rekomendasi kontrakan Anda
    const containerDaftar = document.getElementById('daftar-kontrakan') || document.getElementById('properties-list') || document.querySelector('.grid');
    if (containerDaftar) {
        containerDaftar.innerHTML = '';
    }

    dataKontrakan.forEach(unit => {
        if (markerGroup) {
            const marker = L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(markerGroup);
            marker.bindPopup(`<b>${unit.name}</b><br>Rp ${Number(unit.price).toLocaleString('id-ID')}/bln`);
        }

        if (containerDaftar) {
            containerDaftar.innerHTML += `
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between mb-3" style="color: #333;">
                    <div>
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-gray-800 text-base truncate w-48">${unit.name}</h3>
                            <span class="px-2 py-0.5 text-[10px] rounded-full font-extrabold ${unit.status === 'Tersedia' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">${unit.status}</span>
                        </div>
                        <p class="text-indigo-600 font-extrabold text-sm mt-1">Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan</p>
                        <p class="text-gray-600 text-xs mt-2 mb-4"><b>Fasilitas:</b> ${unit.desc}</p>
                    </div>
                </div>`;
        }
    });
}

document.addEventListener('DOMContentLoaded', muatDataKontrakan);
