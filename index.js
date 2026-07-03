let allProperties = [];
let selectedProperty = null;
let map, markerGroup;

window.addEventListener('DOMContentLoaded', async () => {
    initMap();
    await loadProperties();
});

function initMap() {
    // LANGSUNG DIBUKA DI TITIK KOSAN PAK DAVID KARAWANG
    map = L.map('map').setView([-6.3388566, 107.2686087], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markerGroup = L.layerGroup().addTo(map);
}

async function loadProperties() {
    try {
        const response = await fetch('/api/properties');
        allProperties = await response.json();
        renderProperties(allProperties);
        plotMarkersOnMap(allProperties);
    } catch (e) { console.error(e); }
}

function plotMarkersOnMap(properties) {
    markerGroup.clearLayers();
    properties.forEach(p => {
        if (p.lat && p.lng) {
            const marker = L.marker([p.lat, p.lng]).addTo(markerGroup);
            marker.bindPopup(`
                <b style="font-size: 13px; color: #4f46e5;">${p.name}</b><br>
                <span style="font-weight: 700; color: #16a34a;">Rp ${p.price.toLocaleString()}/bln</span><br>
                <button onclick="window.focusUnitFromMap(${p.id})" style="background: #4f46e5; color: #fff; border:none; padding:4px 8px; border-radius:5px; font-size:10px; margin-top:5px; cursor:pointer;">Pilih Unit</button>
            `);
        }
    });
}

function renderProperties(properties) {
    const container = document.getElementById('properties-list');
    container.innerHTML = '';

    if (properties.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic">Belum ada unit kontrakan tersedia.</p>';
        return;
    }

    properties.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between';
        card.innerHTML = `
            <div>
                <div class="h-42 w-full bg-gray-100 overflow-hidden relative">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div class="p-4 space-y-1">
                    <span class="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-600 font-bold rounded-md">${item.status}</span>
                    <h3 class="font-bold text-sm text-gray-800 mt-1">${item.name}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2">${item.desc || 'Tidak ada deskripsi.'}</p>
                    <p class="text-[11px] text-gray-400 pt-1"><i class="fa-solid fa-location-dot text-indigo-500"></i> Lat: ${item.lat}, Lng: ${item.lng}</p>
                </div>
            </div>
            <div class="p-4 pt-0 flex justify-between items-center mt-2">
                <span class="text-indigo-600 font-extrabold text-sm">Rp ${item.price.toLocaleString()}/bln</span>
                <button onclick="window.focusUnitFromMap(${item.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl transition font-semibold">
                    Lihat & Sewa
                </button>
            </div>`;
        container.appendChild(card);
    });
}

window.focusUnitFromMap = function(id) {
    const p = allProperties.find(item => item.id === id);
    if (p) {
        selectedProperty = p;
        document.getElementById('selected-property-display').className = "p-3 bg-indigo-50 rounded-xl border border-indigo-200 font-semibold text-sm text-indigo-800";
        document.getElementById('selected-property-display').innerText = p.name;
        document.getElementById('booking-price').innerText = p.price.toLocaleString();
        
        map.setView([p.lat, p.lng], 17, { animate: true, duration: 1.2 });
        window.scrollTo({ top: 180, behavior: 'smooth' });
    }
}

document.getElementById('submit-booking-btn').addEventListener('click', async () => {
    if (!selectedProperty) return alert("Silakan klik 'Lihat & Sewa' pada unit kontrakan terlebih dahulu!");
    const tenantName = document.getElementById('tenant-name').value;
    const tenantPhone = document.getElementById('tenant-phone').value;

    if (!tenantName || !tenantPhone) return alert("Tolong isi Nama dan No WhatsApp Anda!");

    const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName, tenantPhone, propertyName: selectedProperty.name, totalPrice: selectedProperty.price })
    });
    
    if ((await res.json()).success) {
        const nomorPenjual = "6281381767806"; // ⚠️ Menggunakan Nomor dari data Kosan Pak David Anda
        const teksPesan = `Halo Pak David, saya berminat sewa unit:\n\n📌 *Unit:* ${selectedProperty.name}\n📍 *Lokasi Koordinat:* ${selectedProperty.lat}, ${selectedProperty.lng}\n👤 *Penyewa:* ${tenantName}\n📞 *WhatsApp:* ${tenantPhone}\n\nMohon info jadwal surveinya, terima kasih!`;
        window.open(`https://api.whatsapp.com/send?phone=${nomorPenjual}&text=${encodeURIComponent(teksPesan)}`, '_blank');
        window.location.reload();
    }
});