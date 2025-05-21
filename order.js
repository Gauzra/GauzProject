// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDCBtr4zEH7plVgQYBMPl047i2NORIldQU",
    authDomain: "icecream-d67cd.firebaseapp.com",
    databaseURL: "https://icecream-d67cd-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "icecream-d67cd",
    storageBucket: "icecream-d67cd.firebasestorage.app",
    messagingSenderId: "1066026702728",
    appId: "1:1066026702728:web:f801cef9350df99a390c3d"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Inisialisasi keranjang belanja
let cart = [];

// Fungsi untuk menambahkan item ke keranjang
function addToCart(name, price, size = null) {
    const item = {
        name,
        price,
        size
    };
    cart.push(item);
    updateCartDisplay();
}

// Fungsi untuk memperbarui tampilan keranjang
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.amount');
    let total = 0;

    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <span>${item.name} ${item.size ? `(${item.size})` : ''}</span>
                <span>Rp ${item.price}</span>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-btn">×</button>
        `;
        cartItems.appendChild(itemElement);
        total += item.price;
    });

    totalElement.textContent = `Rp ${total}`;
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Fungsi untuk memproses pesanan
function processOrder() {
    if (cart.length === 0) {
        alert('Keranjang belanja kosong!');
        return;
    }

    const customerName = document.getElementById('customer-name').value.trim();
    if (!customerName) {
        alert('Mohon masukkan nama Anda!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const notes = document.getElementById('special-notes').value;

    const order = {
        customerName,
        items: [...cart],
        total,
        notes,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    // Simpan pesanan ke Firebase
    database.ref('orders').push(order)
        .then(() => {
            // Reset keranjang dan form
            cart = [];
            updateCartDisplay();
            document.getElementById('customer-name').value = '';
            document.getElementById('special-notes').value = '';

            alert('Pesanan berhasil dibuat! Silakan tunggu konfirmasi dari admin.');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
        });
}

// Fungsi untuk menyaring item menu berdasarkan kategori
function filterMenuItems(category) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = item.dataset.category === category ? 'flex' : 'none';
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Menangani klik tombol kategori
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            filterMenuItems(category); // Panggil fungsi filter saat tombol diklik
        });
    });

    // Menangani klik tombol ukuran
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            const name = menuItem.querySelector('h3').textContent;
            const price = parseInt(btn.dataset.price);
            const size = btn.textContent.split(' - ')[0];

            // Hapus seleksi dari tombol ukuran lain
            menuItem.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Menangani klik tombol tambah ke keranjang
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            const name = menuItem.querySelector('h3').textContent;
            let price, size;

            if (menuItem.dataset.category === 'snack') {
                price = parseInt(btn.dataset.price);
            } else {
                const selectedSizeBtn = menuItem.querySelector('.size-btn.selected');
                if (!selectedSizeBtn) {
                    alert('Silakan pilih ukuran terlebih dahulu!');
                    return;
                }
                price = parseInt(selectedSizeBtn.dataset.price);
                size = selectedSizeBtn.textContent.split(' - ')[0];
            }

            addToCart(name, price, size);
        });
    });

    // Menangani klik tombol checkout
    document.querySelector('.checkout-btn').addEventListener('click', processOrder);

    // Panggil fungsi filter untuk kategori aktif saat halaman dimuat
    const initialCategoryBtn = document.querySelector('.category-btn.active');
    if (initialCategoryBtn) {
        filterMenuItems(initialCategoryBtn.dataset.category);
    }
}); 