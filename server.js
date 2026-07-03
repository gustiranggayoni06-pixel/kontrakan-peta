const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// DATA BAWAAN LANGSUNG MENGGUNAKAN KOORDINAT KOSAN PAK DAVID KARAWANG
let properties = [
    { 
        id: 1, 
        name: "Kosan Pak David", 
        price: 500000, 
        category: "paviliun", 
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=60", 
        desc: "Kamar nyaman, ada wastafel cuci piring, akses strategis dekat KIIC Karawang.", 
        status: "Tersedia", 
        lat: -6.3388566,   
        lng: 107.2686087   
    }
];

let bookings = [];
const ADMIN_CREDENTIALS = { username: "admin", password: "password123" };

// Routing Halaman
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/rahasia-admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// API Properti
app.get('/api/properties', (req, res) => res.json(properties));

app.post('/api/properties/add', (req, res) => {
    const { name, price, category, image, desc, lat, lng } = req.body;
    
    if (!name || !price || !lat || !lng) {
        return res.status(400).json({ success: false, message: "Data tidak lengkap!" });
    }

    const newProperty = {
        id: Date.now(),
        name,
        price: parseInt(price),
        category,
        image: image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&auto=format&fit=crop&q=60",
        desc,
        status: "Tersedia",
        lat: parseFloat(lat),
        lng: parseFloat(lng)
    };
    properties.push(newProperty);
    res.json({ success: true });
});

app.delete('/api/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    properties = properties.filter(p => p.id !== id);
    res.json({ success: true });
});

app.patch('/api/properties/:id/status', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const prop = properties.find(p => p.id === id);
    if (prop) { 
        prop.status = status; 
        res.json({ success: true }); 
    } else { 
        res.status(404).json({ success: false }); 
    }
});

// API Auth Admin & Booking
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/api/admin/bookings', (req, res) => res.json(bookings));
app.post('/api/booking', (req, res) => {
    const { tenantName, tenantPhone, propertyName, totalPrice } = req.body;
    bookings.unshift({
        bookingId: `#RENT-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleTimeString('id-ID'),
        tenantName, tenantPhone, propertyName, totalPrice, status: "Menunggu Survei"
    });
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 KONTRAKAN MAPS AKTIF: http://localhost:${PORT}`));