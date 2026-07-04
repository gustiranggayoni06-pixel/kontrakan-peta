// 🔒 NOMOR WHATSAPP PEMILIK (Ganti dengan nomor Pak David, awali dengan kode negara tanpa tanda +)
const NOMOR_WA_PEMILIK = "6281234567890"; 

const PERMANENT_LAT = -6.3388566;
const PERMANENT_LNG = 107.2686087;

let map;
let markerGroup;
let dataKontrakan = [];

// Membaca database dinamis
function muatDataKontrakan() {
    const stored = localStorage.getItem('properties');
    if (stored) {
        dataKontrakan = JSON.parse(stored);
    } else {
        // Master default awal jika browser belum punya data
        dataKontrakan = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi", status: "Tersedia" },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi", status: "Tersedia" }
        ];
        localStorage.setItem('properties', JSON.stringify(dataKontrakan));
    }
    renderPetaDanList();
}

function renderPetaDanList() {
    const mapElement = document.getElementById('map');
    if (mapElement && !map) {
        map = L.map(mapElement).setView([PERMANENT_LAT, PERMANENT_LNG], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        markerGroup = L.layerGroup().addTo(map);
    } else if (markerGroup) {
        markerGroup.clearLayers();
    }

    const containerDaftar = document.getElementById('properties-list');
    if (containerDaftar) {
        containerDaftar.innerHTML = '';
    }

    dataKontrakan.forEach(unit => {
        if (markerGroup) {
            const marker = L.marker([PERMANENT_LAT, PERMANENT_LNG]).addTo(markerGroup);
            marker.bindPopup(`
                <div style="font-family:sans-serif; font-size:12px;">
                    <strong style="color:#4f46e5;">${unit.name}</strong><br>
                    <span style="color:#16a34a;font-weight:bold;">Rp ${Number(unit.price).toLocaleString('id-ID')}/bulan</span>
                </div>
            `);
        }

        if (containerDaftar) {
            containerDaftar.innerHTML += `
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style="text-align: left;">
                    <div>
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="font-bold text-slate-800 text-sm leading-tight">${unit.name}</h3>
                            <span class="px-2 py-0.5 text-[10px] rounded-full font-black ${unit.status === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${unit.status}</span>
                        </div>
                        <p class="text-[11px] text-indigo-500 font-bold mt-1">Kategori: ${unit.category}</p>
                        <p class="text-indigo-600 font-black text-sm mt-1.5">Rp ${Number(unit.price).toLocaleString('id-ID')} / bulan</p>
                        <p class="text-slate-600 text-xs mt-2 mb-4 leading-relaxed"><b>Fasilitas:</b> ${unit.desc}</p>
                    </div>
                    <div class="flex gap-2 border-t border-slate-100 pt-3">
                        <button onclick="map.setView([${PERMANENT_LAT}], [${PERMANENT_LNG}], 17)" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-all">
                            📍 Peta
                        </button>
                        <button onclick="window.pilihUnitBooking('${unit.name}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm shadow-indigo-100">
                            📝 Sewa & Survei
                        </button>
                    </div>
                </div>`;
        }
    });
}

window.pilihUnitBooking = function(namaUnit) {
    const inputUnit = document.getElementById('unit-terpilih');
    const formBooking = document.getElementById('form-booking');
    if (inputUnit) inputUnit.value = namaUnit;
    if (formBooking) formBooking.scrollIntoView({ behavior: 'smooth' });
};

// === SISTEM DIRECT KE WHATSAPP ===
document.getElementById('booking-form-wa').addEventListener('submit', function(e) {
    e.preventDefault();
    const unit = document.getElementById('unit-terpilih').value;
    const nama = document.getElementById('tenant-name').value.trim();
    const hp = document.getElementById('tenant-phone').value.trim();

    if(!unit) {
        alert("Silakan pilih unit kontrakan terlebih dahulu dengan mengeklik tombol 'Sewa & Survei'!");
        return;
    }

    // Merangkai teks template WhatsApp agar rapi saat diterima pemilik
    const teksWA = `Halo Pak David, saya ingin mengajukan sewa/survei kontrakan.%0A%0A` +
                   `▪️ *Unit Terpilih :* ${unit}%0A` +
                   `▪️ *Nama Penyewa :* ${nama}%0A` +
                   `▪️ *No. WhatsApp :* ${hp}%0A%0A` +
                   `Apakah unit tersebut masih tersedia dan kapan saya bisa datang untuk survei lokasi? Terima kasih.`;

    // Redirect otomatis membuka aplikasi WhatsApp browser/HP
    window.open(`https://api.whatsapp.com/send?phone=${NOMOR_WA_PEMILIK}&text=${teksWA}`, '_blank');
});

document.addEventListener('DOMContentLoaded', muatDataKontrakan);
