let userProperties = [];

function loadUserProperties() {
    // Mengambil data real-time hasil kendali penuh halaman admin
    const stored = localStorage.getItem('properties');
    if (stored) {
        userProperties = JSON.parse(stored);
    } else {
        // Jika admin belum membuat data apa pun, pakai data bawaan awal
        userProperties = [
            { id: 1, name: "Kosan Pak David - Kamar Standard", price: 550000, category: "Kamar Mandi Dalam", desc: "Listrik token, wifi free, air lancar", status: "Tersedia" },
            { id: 2, name: "Kosan Pak David - Kamar Ber-AC", price: 600000, category: "Fasilitas AC", desc: "AC 1/2 PK, Kasur Springbed, Lemari", status: "Tersedia" }
        ];
    }

    // TAMPILKAN KE LIST DAFTAR KOSAN DI HALAMAN UTAMA
    const listContainer = document.getElementById('properties-list'); // Sesuaikan ID elemen HTML Anda
    if (listContainer) {
        listContainer.innerHTML = '';
        userProperties.forEach(p => {
            listContainer.innerHTML += `
                <div class="card-kosan">
                    <h3>${p.name}</h3>
                    <p class="Harga">Rp ${p.price.toLocaleString('id-ID')}/bulan</p>
                    <p class="Fasilitas">${p.desc}</p>
                    <span class="badge ${p.status === 'Tersedia' ? 'bg-green' : 'bg-red'}">${p.status}</span>
                </div>`;
        });
    }
}

// Jalankan fungsi saat web dibuka oleh user
document.addEventListener('DOMContentLoaded', loadUserProperties);
