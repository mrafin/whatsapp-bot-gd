const questionList = {
    "1":"Selamat Datang di Temangabutmu.\nTerima kasih telah menghubungi kami.\nUntuk info promo dapat dilihat pada website kami:\nhttps://temangabutmu.com/ \nSilahkan memilih kebutuhan Anda:\n1. Lihat Katalog (Pembelian melalui Whatsapp)\n2. Upgrade Pembelian\n3. Informasi dan Kendala\n4. Join member temangabutmu (Pembelian melalui Website)\n5. Cek transaksi yang telah dibeli",
    "10":"Silahkan kirim format pemesanan dari Admin Shopee/Lazada/Itemku.\n\n0. Kembali ke Menu Utama",
    "2":"Silahkah pilih menu:\n{variant}\n\n0. Kembali ke menu utama",
    "3":"Berikut pricelist {variant}:\n{produk}\n0. Kembali ke menu utama",
    "4":"Silahkan masukkan nama Anda\n\n0. Kembali ke Menu Utama",
    "19":"Silahkan masukkan email Anda\n\n0. Kembali ke Menu Utama",
    "20":"Registrasikan diri Anda menjadi member Temangabutmu dan lakukan transaksi untuk mendapatkan poin member melalui:\nhttps://temangabutmu.com/\n\n0. Kembali ke Menu Utama",
    "21":"{template_history}",
    "22":"1. Pembelian sebelumnya dari Whatsapp/Website\n2. Pembelian sebelumnya dari  Shopee/Sumber Lain\n\n0. Kembali ke Menu Utama",
    "23":"Mohon masukan email akun anda sebelumnya\n\n0. Kembali ke Menu Utama",
    
    
    
    "5":"Nama : {name}\nEmail: {email}\nMenu : {produk} \nApakah data diatas sudah benar?\n1. Sudah, lanjut pembayaran\n2. Belum, kembali ke Menu",
    "6":"Total: Rp {price}\nSilahkan melakukan pembayaran pada Qris berikut:\n\n Apabila sudah transfer, mohon kirimkan bukti transfer. .",
    "7":"Mohon selesaikan pembayaran dan tunggu sampai proses selesai.",
    "8":"1. Lanjut Transaksi\n\n0. Kembali ke Menu Utama",
    "9":"Apakah sudah memiliki kode transaksi dari Shopee?\n1. Sudah\n2. Belum, saya baru mau bertransaksi\n\n0 . Kembali ke Menu Utama",
    
    "11":"Silahkan bertransaksi pada shopee kami berikutini\n(link shopee 1)\n(link shopee 2)\n(link shopee 3)\n(link shopee 4)\n(link shopee 5)\n\nAtau dapat pilih:\n1. Transaksi dengan Whatsapp\n\n0. Kembali ke Menu Utama ",
    "12":"Silahkan bertransaksi pada website kami berikut ini. https://temangabutmu.com/ \n\n0. Kembali ke Menu Utama",
    "13":"Pastikan pembelian akun Anda sebelumnya tidak lewat 1x24 jam dari waktu transaksi\nSilahkan kirim kode transaksi Anda sebelumnya.\n\n0. Kembali ke Menu Utama",
    "18":"Akun : {current_product}\n\nSilahkan pilih menu upgrade berikut:\n{list_product}\n0. Kembali ke menu utama",
    "14":"Nama : {name}\nEmail: {email}\nMenu : {produk} \nApakah data diatas sudah benar?\n1. Sudah, lanjut pembayaran\n\n0. Kembali ke Menu Utama",
    //"15":"Email produk sharing yang Anda kirim tidak ditemukan. Mohon kirim kembali email produk dengan benar.",
    "15":"Total: Rp {price}\nSilahkan transfer menggunakan QRIS berikut",
    "16":"Pilih jenis\n1. Netflix\n2. spoitify\n3. Vidio\n4. Viu\n5. Canva\n6. youtube\n7. We tv\n8. Prime vidio\n9. Capcut\n10. HBO\n11. Vision+\n12. Aplikasi lainya\n\n0. Kembali ke Menu Utama",
    "161":`1. Kendala dalam mengatur pin\n2. Kendala tidak bisa login/salah sandi paket sharing \n3. Kendala tidak bisa login/salah sandi paket Private\n4. Kendala Screen Limit paket Sharing\n5. Kendala Screen Limit  paket Private\n6. Kendala Screen Limit paket Platinum\n7. Kendala Pembayaran Gagal di Netflix / perbarui pembayaran\n8. perbarui alamat rumah/household/Netflix  mu bukan bagian dari rumah ini\n\n0. Kembali ke Menu Utama`,
    "1611":`- Pastikan  menggunakan paket data / hotspot untuk login pertama kali, bukan Wi-Fi rumah.
- Jika sudah menggunakan paket data dan belum bisa login, coba tunggu 15-60 menit lalu login ulang
- ⁠Jika ada keterangan Something went wrong / terjadi kesalahan, harap dijeda untuk login karena sharing rawan kena Spam login atau gantian login dengan customer lain
- ⁠jika di rasa  terlalu lama untuk login DI sarankan UPGRADE KE PRIVATE  SUPAYA MENIKMATI LAYANAN TERBAIK DARI KAMI,BIOSKOP AJA 35k 1film disini cukup private. (CUKUP KETIK MAU UPGRADE)
- ⁠Jika masih belom bisa hub CUSTOMER SERVICE dengan mengisi formulir berikut
(KETIK SAJA HUBUNGI CS)`, 
    "1612":`- Pastikan  menggunakan paket data / hotspot untuk login pertama kali, bukan Wi-Fi rumah
- Jika ingin login di TV dan tidak bisa login, harap loginkan di HP terlebih dahulu, lalu pilih login dengan ponsel di HP dan scan barcode yang ditampilkan.
- Jika masih tidak bisa, hubungi customer service.
(KETIK SAJA HUBUNGI CS)
`,
    "1613":`- Menunggu user lain selesai nonton
- Jika login di HP/TAB bisa di download film dan ditonton di mode offline (matikan internet)
- Jika di TV/PC terkene screen limit, bisa upgrade ke *Private dengan membayar kekurangannya saja. dan  nikmati kualitas terbaik dari layanan kami.*
(CUKUP KETIK MAU UPGRADE)
`,
    "1614":`- Tunggu 10-15 menit
- Jika masih belum bisa, hubungi customer service
(CUKUP KETIK MAU UPGRADE)
(KETIK SAJA HUBUNGI CS)

`,
    "1615":`Hubungi customer service
(KETIK SAJA HUBUNGI CS)
`,
    "1616":`- Pastikan akun Netflix yang digunakan tidak dalam masa berlangganan yang sudah habis. Durasi Netflix sesuai Snk yaitu 27-30 Hari. 
- Jika masa berlangganan masih ada, klik X/not now /nanti, lalu lanjutkan menonton
- Jika masa berlangganan masih ada dan tidak bisa di klik Nanti, hubungi customer service.
(KETIK SAJA HUBUNGI CS)

`,
    "1617":`- klik i’m traveling/saya sedang berpergian/tonton sementara
- klik kirim email dan minta kode OTP ke customer service
(KETIK SAJA HUBUNGI CS)

`,
    "162":`hub customer service karena akunya sudah tidak premium, dengan mengisi formulir berikut
(KETIK SAJA HUBUNGI CS)
`,
    "163":"1. Kendala tidak bisa login/salah sandi paket sharing dan private\n2. Kendala Screen Limit/batasan menonton paket Sharing\n\n0. Kembali ke Menu Utama",
    "1631":`- Pastikan  menggunakan paket data / hotspot untuk login pertama kali, bukan Wi-Fi rumah.
- Jika sudah menggunakan paket data dan belum bisa login, re install aplikasi vidio kemudian login
- jika cara A dan B masih belom bisa Hub customer service
(KETIK SAJA HUBUNGI CS)
`,
    "1632":`- Menunggu user lain selesai nonton
- Jika login di HP/TAB bisa di download film dan ditonton di mode offline (matikan internet)
- Jika di TV/PC terkene screen limit, bisa upgrade ke Private dengan membayar kekurangannya saja. dan  nikmati kualitas terbaik dari layanan kami (CUKUP KETIK MAU UPGRADE)

`,
    "164":`*Kendala tidak bisa login*
Pastikan pilih halaman masuk di pojok  kanan (bukan daftar)
Jika  masih tidak bisa hub customer service
(KETIK SAJA HUBUNGI CS)

`,
    "165":`*Kendala akun tidak premium lagi*
hub customer service karena akunya sudah tidak premium, dengan mengisi formulir berikut
(KETIK SAJA HUBUNGI CS)

`,
"166":"1. Kendala undangan premium tidak masuk di inbox\n2. Sudah terima undangan tapi masih ada iklan atau tidak premium\n3. Kendala akun tidak premium lag\n\n0. Kembali ke Menu Utama",
"1661":`- pastikan email buat cek inbox atau email yg di kirim ke seller sama 
- cek di folder spam kalau tidak ada di inbox
- cek semua folder bisa tidak ada di spam juga
- kalau masih tidak ada hub customer service
(KETIK SAJA HUBUNGI CS)

`,
"1662":`- pastikan email yg di premiumkan belum pernah premium sebelumnya
- dalam setahun email hanya bis di premiumkan family 1x saja
- jika sudah terlanjur hubungi customer service dengan kasih alamat email baru yang belum pernah premium sebelumnya dengan mengisi formulir berikut
(KETIK SAJA HUBUNGI CS)

`,
"1663":`hub custimer cervice karena akunya sudah tidak premium, dengan mengisi 
(KETIK SAJA HUBUNGI CS) 
`,
"167":`- Jika ada tanda trailer itu bearti episode atau film tersebut belum rilis dari pihak we tv, solusi di tunggu samapai pihak we tvnya merilis film atau episode ter sebut
- Jika ada tanda express di salah satu episode itu harus membayar untuk menonoton episode tersebut
- Jika film atau series bertanda VIP tidka bisa di tonton hub customer service dengan mengisi formulir berikut
(KETIK SAJA HUBUNGI CS)

`,
"168":`- Video Tidak Merespons
  a. Coba mulai ulang perangkat atau aplikasi Prime Video, periksa koneksi internet, dan pastikan perangkat atau browser web sudah diperbarui
- Kode Kesalahan
  a. Kode kesalahan seperti 5004, 9345, atau lainnya dapat menunjukkan masalah server atau koneksi, Coba mulai ulang perangkat atau periksa koneksi internet
- Konten Tidak Tersedia
  a. Beberapa judul mungkin tidak tersedia di wilayah indonesia atau telah dihapus dari layanan. Coba periksa ketersediaan konten di Prime Video
-Jika masih belom bisa hub CUSTOMER SERVICE
(KETIK SAJA HUBUNGI CS)


`,
"169":`- tidak bisa login dengan email di aplikasi PC
  a. login kan dulu akun capcut nya di aplikasi di hp
  b. kalau sudah login pilih profile dengan tanda orang
  c. pilih pindai / scan
  d. di aplikasi capcut yang di PC piliih sign in atau masuk
  e. pilih user code qr dan arahkan kamera hp ke kode qr yg di PC
- Kendala tidak bisa login dari HP
  a. instal ulang aplikasi  terlebih dahulu
- Jika masih belom bisa hub CUSTOMER SERVICE
(KETIK SAJA HUBUNGI CS)
`,
"16-10":`- Aplikasi tidak mau terbuka atau tidak bisa mengunduh
  a. Mulai ulang perangkat, perbarui aplikasi, hapus cache, atau coba instal ulang aplikasi
- Jika masih belom bisa hub CUSTOMER SERVICE
(KETIK SAJA HUBUNGI CS)

`,
"16-11":`- Kendala tidak bisa login 
  a. Pastikan  menggunakan paket data / hotspot untuk login pertama kali, bukan Wi-Fi rumah.
  b. Jika depan akun tertulis tere@, hapus "tere@" dan langsung login menggunakan nomor di belakangnya (contoh: EMAIL: tere@6281299488372, PASSWORD: Ladang2020, maka login dengan nomer 6281299488372 saja).
- Kendala Screen Limit Sharing 
  a. Menunggu user lain selesai nonton karena sharing harus antri
  b. bisa upgrade ke private jika ingin lebih nyaman menonton
- Kendala Screen Limit private 
  a. clear chache aplikasi terlebih dahulu baru login kembali, dikarenakan ada bug dari visionnya
- jika masih tidak bisa hubungi Customer Service
(KETIK SAJA HUBUNGI CS)

`,
"16-12":`Hubungi customer service dengan format berikut:
(KETIK SAJA HUBUNGI CS)

`,
    "17":"0. Kembali ke Menu Utama ",
    "99":"Apakah terdapat kendala?\n\n1. Ya\n2. Tidak, Kembali ke Menu Utama",
    
    

}

module.exports = questionList;


