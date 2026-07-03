// 1. DATABASE STATIS - Mengunci data langsung di front-end agar permanen dan tidak polos di Vercel
const dataKontrakan = [
    {
        id: 1,
        nama: "Kosan Pak David - Kamar Standard A",
        harga: "Rp 800.000 / bulan",
        fasilitas: "Kamar Mandi Dalam, Kasur Busa, Lemari Pakaian, Listrik Token, Free WiFi",
        lat: -6.3128,  // Ubah angka ini sesuai dengan Latitude asli lokasi Kosan Pak David
        lng: 107.2945, // Ubah angka ini sesuai dengan Longitude asli lokasi Kosan Pak David
        whatsapp: "6281234567890" // Ganti dengan nomor WhatsApp Pak David (Wajib diawali angka 62)
    },
    {
        id: 2,
        nama: "Kosan Pak David - Kamar AC Eksklusif",
        harga: "Rp 1.200.000 / bulan",
        fasilitas: "AC 1/2 PK, Kamar Mandi Dalam, Kasur Springbed, Meja Kerja, WiFi Kecepatan Tinggi",
        lat: -6.3150,  // Koordinat untuk unit kedua (jika ada)
        lng: 107.2990,
        whatsapp: "6281234567890" 
    }
];

// 2. INISIALISASI PETA LEAFLET
// Set tampilan awal kamera peta berpusat di koordinat kontrakan pertama dengan zoom level 14
const map = L.map('map').setView([dataKontrakan[0].lat, dataKontrakan[0].lng], 14);

// Memuat gambar visual peta gratis menggunakan OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. MENAMPILKAN DATA KE HALAMAN (MARKER PETA & LIST KARTU)
const containerDaftar = document.getElementById('daftar-kontrakan');

dataKontrakan.forEach(unit => {
    // A. Membuat Pin (Marker) Merah di Atas Peta
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

    // B. Membuat Kartu Daftar Rekomendasi di Bagian Bawah Peta
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

// 4. FUNGSI TOMBOL INTERAKTIF
// Fungsi untuk menggeser kamera peta langsung ke lokasi kontrakan yang diklik
function fokusPeta(lat, lng) {
    map.setView([lat, lng], 16);
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Fungsi untuk mengisi kolom "Unit Terpilih" secara otomatis di Form Booking
function pilihUnit(namaUnit) {
    document.getElementById('unit-terpilih').value = namaUnit;
    document.getElementById('form-booking').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 5. PROSES PENGIRIMAN DATA FORM LANGSUNG KE WHATSAPP PEMILIK
document.getElementById('form-booking').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const unit = document.getElementById('unit-terpilih').value;
    const nama = document.getElementById('nama-pencari').value;
    const wa = document.getElementById('wa-pencari').value;

    if (!unit) {
        alert("Silakan pilih salah satu unit kontrakan terlebih dahulu melalui peta atau klik tombol 'Sewa & Survei'!");
        return;
    }

    // Mengambil nomor tujuan WhatsApp pemilik dari data unit pertama
    const nomorTujuan = dataKontrakan[0].whatsapp; 
    
    // Menyusun isi teks format pesan otomatis WhatsApp
    const teksPesan = `Halo Pak, saya *${nama}* (${wa}) ingin mengajukan jadwal booking survei lokasi langsung untuk properti *${unit}* yang saya temukan melalui aplikasi peta KontrakanMaps.`;
    
    // Membuka WhatsApp Web atau Aplikasi WhatsApp secara otomatis di tab baru
    window.open(`https://api.whatsapp.com/send?phone=${nomorTujuan}&text=${encodeURIComponent(teksPesan)}`, '_blank');
});