// 1. DATABASE STATIS - Harga & Posisi Sukaharja Karawang
const dataKontrakan = [
    {
        id: 1,
        nama: "Kosan Pak David - Kamar Standard",
        harga: "Rp 550.000 / bulan",
        fasilitas: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi",
        lat: -6.3235,  // 📌 Koordinat Sukaharja Karawang (Silakan sesuaikan detailnya jika perlu)
        lng: 107.3155, // 📌 Koordinat Sukaharja Karawang
        whatsapp: "6283157363740" // Ganti dengan nomor WhatsApp Pak David aktif
    },
    {
        id: 2,
        nama: "Kosan Pak David - Kamar Ber-AC",
        harga: "Rp 600.000 / bulan",
        fasilitas: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi",
        lat: -6.3235,  // Disamakan agar pin menumpuk di area bangunan yang sama
        lng: 107.3155, 
        whatsapp: "6283157363740" 
    }
];

// 2. INISIALISASI PETA LEAFLET
const map = L.map('map').setView([dataKontrakan[0].lat, dataKontrakan[0].lng], 16); // Zoom ditingkatkan ke 16 agar lebih dekat

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. MENAMPILKAN DATA KE MARKS PETA & KARTU DAFTAR
const containerDaftar = document.getElementById('daftar-kontrakan');
containerDaftar.innerHTML = ''; 

dataKontrakan.forEach(unit => {
    // A. Menempelkan PIN / Marker ke Peta
    const marker = L.marker([unit.lat, unit.lng]).addTo(map);
    marker.bindPopup(`
        <div class="p-1">
            <h3 class="font-bold text-indigo-600 text-sm">${unit.nama}</h3>
            <p class="text-xs font-bold text-green-600 mt-0.5">${unit.harga}</p>
            <p class="text-[11px] text-gray-500 my-1">${unit.fasilitas}</p>
            <button onclick="pilihUnit('${unit.nama}')" class="w-full mt-1 bg-indigo-600 text-white text-[11px] py-1 px-2 rounded hover:bg-indigo-700 transition-colors">
                Pilih Unit Ini
            </button>
        </div>
    `);

    // B. Menempelkan Kartu Informasi Kontrakan
    const kartuHtml = `
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                <h3 class="font-bold text-gray-800 text-base leading-snug">${unit.nama}</h3>
                <p class="text-indigo-600 font-extrabold text-sm mt-1">${unit.harga}</p>
                <p class="text-gray-600 text-xs mt-2 mb-4 leading-relaxed">✨ <b>Fasilitas:</b> ${unit.fasilitas}</p>
            </div>
            <div class="flex gap-2 mt-auto">
                <button onclick="fokusPeta(${unit.lat}, ${unit.lng})" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors">
                    Lihat Posisi Peta
                </button>
                <button onclick="pilihUnit('${unit.nama}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                    Sewa & Survei
                </button>
            </div>
        </div>
    `;
    containerDaftar.innerHTML += kartuHtml;
});

// 4. FUNGSI NAVIGASI PETA INTERAKTIF
function fokusPeta(lat, lng) {
    map.setView([lat, lng], 17);
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function pilihUnit(namaUnit) {
    document.getElementById('unit-terpilih').value = namaUnit;
    document.getElementById('form-booking').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 5. INTERSEPSI SUBMIT FORM UNTUK DIALIRKAN KE WHATSAPP
document.getElementById('form-booking').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const unit = document.getElementById('unit-terpilih').value;
    const nama = document.getElementById('nama-pencari').value;
    const wa = document.getElementById('wa-pencari').value;

    if (!unit) {
        alert("Silakan pilih salah satu unit kontrakan terlebih dahulu!");
        return;
    }

    const nomorTujuan = dataKontrakan[0].whatsapp; 
    const teksPesan = `Halo Pak, saya *${nama}* (${wa}) ingin mengajukan jadwal booking survei lokasi langsung untuk properti *${unit}* yang saya temukan melalui aplikasi peta KontrakanMaps.`;
    
    window.open(`https://api.whatsapp.com/send?phone=${nomorTujuan}&text=${encodeURIComponent(teksPesan)}`, '_blank');
});
