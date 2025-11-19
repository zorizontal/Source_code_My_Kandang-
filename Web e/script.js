// Data dummy dan LocalStorage
let data = JSON.parse(localStorage.getItem('peternakanData')) || {
    unggas: [],
    pakan: [],
    kesehatan: { vaksin: ['DOC: ND', 'Minggu 2: IB', 'Minggu 4: CRD'], gejala: { 
          'demam': 'ND - Vaksinasi segera',
    'diare': 'Coccidiosis - Berikan obat',
    'batuk': 'CRD - Isolasi ayam',
    'nafsu makan turun': 'CRD ringan atau Kolera',
    'lemas': 'Kolera / infeksi bakteri',
    'kotoran putih': 'Pullorum',
    'kotoran hijau': 'Newcastle Disease',
    'kotoran berdarah': 'Coccidiosis - pengobatan segera',
    'mata berair': 'Snot / Coryza',
    'bersin': 'Infectious Bronchitis (IB)',
    'leher terpuntir': 'Newcastle Disease (ND)',
    'sesak napas': 'CRD atau ND atau Flu Burung',
    'produksi telur turun': 'IB atau ND atau kurang nutrisi',
    'jengger luka': 'Fowl Pox (Cacar Ayam)'
     } },
    produksi: [],
    keuangan: { biaya: [], pendapatan: [] },
    edukasi: [
    { judul: 'Dashboard Utama', 
        isi: 'Menampilkan ringkasan kondisi peternakan dan notifikasi penting.' },

    { judul: 'Unggas & Umur', 
        isi: 'Digunakan untuk mencatat jumlah ayam dan umur ayam agar populasi selalu terpantau.' },

    { judul: 'Manajemen Pakan', 
        isi: 'Menghitung kebutuhan pakan harian dan mencatat stok masuk serta keluar.' },

    { judul: 'Kesehatan & Vaksinasi', 
        isi: 'Menampilkan jadwal vaksin dan memberikan diagnosa berdasarkan gejala yang dimasukkan.' },

    { judul: 'Produksi & Pertumbuhan', 
        isi: 'Mencatat berat badan dan jumlah telur serta menampilkan grafik perkembangan.' },

    { judul: 'Keuangan', 
        isi: 'Mencatat biaya dan pendapatan lalu menghitung laba, rugi, dan BEP otomatis.' },

    { judul: 'Tools / Kalkulator', 
        isi: 'Menghitung kepadatan kandang, FCR, dan total biaya pakan.' },

    { judul: 'Navigasi Mobile', 
        isi: 'Menu dapat dibuka lewat hamburger dan otomatis menutup saat item dipilih.' }
]
};

// Simpan ke LocalStorage
function saveData() {
    localStorage.setItem('peternakanData', JSON.stringify(data));
}

// Navigasi section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    loadSection(sectionId);
}

// Load data per section
function loadSection(section) {
    if (section === 'dashboard') {
        document.getElementById('dashboard-summary').innerHTML =
            `<p>Jumlah Ayam: ${data.unggas.length > 0 ? data.unggas[0].jumlah : 0}, Suhu: 25°C, Kelembapan: 60%, Pakan Tersisa: 90kg</p>`;
        document.getElementById('notifications').innerHTML =
            '<p>Notifikasi: Pakan hampir habis (kurang dari 20kg), Vaksinasi ND minggu depan, 2 ayam mati hari ini</p>';

    } else if (section === 'unggas') {
        updateUnggasTable();
        setTimeout(updateChartUnggas, 50); // FIX

    } else if (section === 'pakan') {
        setTimeout(updateChartPakan, 50); // FIX

    } else if (section === 'kesehatan') {
        document.getElementById('jadwal-vaksin').innerHTML =
            data.kesehatan.vaksin.map(v => `<p>${v}</p>`).join('');

    } else if (section === 'produksi') {
        setTimeout(updateChartProduksi, 50); // FIX

    } else if (section === 'keuangan') {
        updateLaporanKeuangan();

    } else if (section === 'edukasi') {
        document.getElementById('artikel-list').innerHTML =
            data.edukasi.map(a => `<div><h3>${a.judul}</h3><p>${a.isi}</p></div>`).join('');
    }
}

// Unggas
document.getElementById('unggas-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const jumlah = parseInt(document.getElementById('jumlah-ayam').value);
    const umur = parseInt(document.getElementById('umur-ayam').value);
    data.unggas.push({ jumlah, umur });
    saveData();
    loadSection('unggas');
});

function updateUnggasTable() {
    const table = document.getElementById('unggas-table');
    table.innerHTML =
        '<tr><th>Jumlah</th><th>Umur (minggu)</th></tr>' +
        data.unggas.map(u => `<tr><td>${u.jumlah}</td><td>${u.umur}</td></tr>`).join('');
}

function updateChartUnggas() {
    const ctx = document.getElementById('chart-unggas').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Petelur', 'Pedaging'],
            datasets: [{
                data: [data.unggas.filter(u => u.jumlah > 0).length, 0],
                backgroundColor: ['#FF6384', '#36A2EB']
            }]
        }
    });
}

// Pakan
document.getElementById('pakan-calc').addEventListener('submit', function (e) {
    e.preventDefault();
    const umur = parseInt(document.getElementById('umur-pakan').value);
    const jenis = document.getElementById('jenis-pakan').value;
    const jumlahAyam = data.unggas.length > 0 ? data.unggas[0].jumlah : 100;
    const kebutuhan = jenis === 'pedaging'
        ? umur * 0.01 * jumlahAyam
        : umur * 0.008 * jumlahAyam;

    document.getElementById('pakan-result').innerHTML =
        `Kebutuhan Pakan Harian: ${kebutuhan.toFixed(2)}kg`;
});

document.getElementById('stok-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const masuk = parseFloat(document.getElementById('stok-masuk').value);
    const keluar = parseFloat(document.getElementById('stok-keluar').value);
    const sisaSebelum = data.pakan.length > 0 ? data.pakan[data.pakan.length - 1].sisa : 100;
    const sisa = sisaSebelum + masuk - keluar;
    data.pakan.push({ masuk, keluar, sisa });
    saveData();
    updateChartPakan();
});

function updateChartPakan() {
    const ctx = document.getElementById('chart-pakan').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.pakan.map((_, i) => `Hari ${i + 1}`),
            datasets: [{
                label: 'Sisa Stok (kg)',
                data: data.pakan.map(p => p.sisa),
                borderColor: '#4CAF50'
            }]
        }
    });
}

// Kesehatan
document.getElementById('diagnosa-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const gejala = document.getElementById('gejala').value.toLowerCase();
    const result = data.kesehatan.gejala[gejala] ||
        'Gejala tidak dikenali - Konsultasikan dokter hewan';
    document.getElementById('diagnosa-result').innerHTML =
        `Rekomendasi: ${result}`;
});

// Produksi
document.getElementById('produksi-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const berat = parseFloat(document.getElementById('berat-badan').value) || 0;
    const telur = parseInt(document.getElementById('jumlah-telur').value) || 0;
    data.produksi.push({ berat, telur });
    saveData();
    updateChartProduksi();

    const pakanTotal = data.pakan.reduce((sum, p) => sum + p.keluar, 0) || 1;
    const fcr = berat / pakanTotal;
    document.getElementById('prediksi-fcr').innerHTML =
        `Prediksi FCR: ${fcr.toFixed(2)} (Feed Conversion Ratio)`;
});

function updateChartProduksi() {
    const ctx = document.getElementById('chart-produksi').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.produksi.map((_, i) => `Minggu ${i + 1}`),
            datasets: [
                { label: 'Berat Badan (kg)', data: data.produksi.map(p => p.berat), borderColor: '#FF6384' },
                { label: 'Jumlah Telur', data: data.produksi.map(p => p.telur), borderColor: '#36A2EB' }
            ]
        }
    });
}

// Keuangan
document.getElementById('biaya-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const kategori = document.getElementById('kategori-biaya').value;
    const jumlah = parseFloat(document.getElementById('jumlah-biaya').value);
    data.keuangan.biaya.push({ kategori, jumlah });
    saveData();
    updateLaporanKeuangan();
});

document.getElementById('pendapatan-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const jenis = document.getElementById('jenis-pendapatan').value;
    const jumlah = parseFloat(document.getElementById('jumlah-pendapatan').value);
    data.keuangan.pendapatan.push({ jenis, jumlah });
    saveData();
    updateLaporanKeuangan();
});

function updateLaporanKeuangan() {
    const totalBiaya = data.keuangan.biaya.reduce((sum, b) => sum + b.jumlah, 0);
    const totalPendapatan = data.keuangan.pendapatan.reduce((sum, p) => sum + p.jumlah, 0);
    const laba = totalPendapatan - totalBiaya;
    const bep = totalBiaya / (totalPendapatan > 0 ? totalPendapatan : 1);

    document.getElementById('laporan-keuangan').innerHTML =
        `<p>Total Biaya: Rp${totalBiaya.toLocaleString()}, 
        Total Pendapatan: Rp${totalPendapatan.toLocaleString()}, 
        Laba/Rugi: Rp${laba.toLocaleString()}, BEP: ${bep.toFixed(2)}</p>`;
}

function simulasiSkenario() {
    const pendapatanBaru = data.keuangan.pendapatan.reduce((sum, p) =>
        sum + (p.jenis === 'telur' ? p.jumlah * 1.1 : p.jumlah), 0);

    const biayaBaru = data.keuangan.biaya.reduce((sum, b) =>
        sum + (b.kategori === 'pakan' ? b.jumlah * 1.1 : b.jumlah), 0);

    const labaBaru = pendapatanBaru - biayaBaru;

    document.getElementById('simulasi-result').innerHTML =
        `Simulasi Harga Telur +10% & Pakan +10%: Pendapatan Rp${pendapatanBaru.toLocaleString()}, 
        Biaya Rp${biayaBaru.toLocaleString()}, 
        Laba Rp${labaBaru.toLocaleString()}`;
}

// Tools
document.getElementById('kalkulator-kandang').addEventListener('submit', function (e) {
    e.preventDefault();
    const luas = parseFloat(document.getElementById('luas-kandang').value);
    const densitas = parseFloat(document.getElementById('densitas').value);
    const kebutuhan = Math.floor(luas * densitas);
    document.getElementById('kandang-result').innerHTML =
        `Kebutuhan Ayam Maksimal: ${kebutuhan} ekor`;
});

document.getElementById('kalkulator-fcr').addEventListener('submit', function (e) {
    e.preventDefault();
    const berat = parseFloat(document.getElementById('berat-akhir').value);
    const pakan = parseFloat(document.getElementById('pakan-total').value);
    const fcr = berat / pakan;
    document.getElementById('fcr-result').innerHTML =
        `FCR: ${fcr.toFixed(2)} (kg pakan per kg berat)`;
});

document.getElementById('kalkulator-biaya-pakan').addEventListener('submit', function (e) {
    e.preventDefault();
    const periode = parseInt(document.getElementById('periode-pakan').value);
    const harga = parseFloat(document.getElementById('harga-pakan').value);
    const jumlahAyam = data.unggas.length > 0 ? data.unggas[0].jumlah : 100;
    const kebutuhanHarian = 0.08 * jumlahAyam;
    const biaya = periode * kebutuhanHarian * harga;

    document.getElementById('biaya-pakan-result').innerHTML =
        `Biaya Pakan Total: Rp${biaya.toLocaleString()}`;
});

// Load initial section
showSection('dashboard');
function toggleMenu() {
    const menu = document.getElementById("nav-menu");
    const ham = document.querySelector(".hamburger");
    const title = document.getElementById("nav-title");

    menu.classList.toggle("active");
    ham.classList.toggle("active");

    // Sembunyikan judul saat hamburger aktif (mobile)
    if (ham.classList.contains("active")) {
        title.classList.add("hide-title");
    } else {
        title.classList.remove("hide-title");
    }
}


document.querySelectorAll("#nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
        const menu = document.getElementById("nav-menu");
        const ham = document.querySelector(".hamburger");
        const title = document.getElementById("nav-title");

        menu.classList.remove("active");
        ham.classList.remove("active");
        title.classList.remove("hide-title");
    });          
});

