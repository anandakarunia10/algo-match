export const PSEUDOCODE_INTRO = {
  title: "Pengertian & Fungsi Pseudocode",
  definition:
    "Pseudocode (kode semu) adalah cara menuliskan langkah-langkah algoritma menggunakan bahasa terstruktur yang menyerupai kode pemrograman namun mudah dibaca manusia.",
  purpose:
    "Membantu programmer merancang logika secara ringkas dan sistematis tanpa terikat aturan sintaks bahasa pemrograman tertentu.",
  note:
    "Catatan Penting: Penulisan sintaks Pseudocode tidak bersifat kaku dan dapat bervariasi berdasarkan konvensi atau gaya penulisan yang digunakan (misalnya START/BEGIN, INPUT/READ, OUTPUT/PRINT).",
};

export const PSEUDOCODE_DATA = [
  {
    id: "start",
    name: "START",
    syntax: "START\n  // deklarasi awal",
    functionDesc: "Menandakan titik dimulainya eksekusi sebuah algoritma.",
    explanation:
      "Perintah START (atau BEGIN) digunakan pada baris pertama pseudocode untuk menandai bahwa urutan instruksi algoritma dimulai.",
    hint: "Perintah ini selalu diletakkan di bagian paling atas sebagai pembuka algoritma.",
  },
  {
    id: "input",
    name: "INPUT",
    syntax: "INPUT nilai_ujian",
    functionDesc: "Menerima data atau masukan nilai dari pengguna ke dalam variabel.",
    explanation:
      "Perintah INPUT (sering juga ditulis READ) berfungsi membaca data yang dimasukkan pengguna agar dapat diproses oleh algoritma.",
    hint: "Perhatikan kata kunci yang bertugas mengambil data dari luar/pengguna.",
  },
  {
    id: "output",
    name: "OUTPUT",
    syntax: "OUTPUT \"Lulus\"",
    functionDesc: "Menampilkan hasil pemrosesan atau keluaran informasi kepada pengguna.",
    explanation:
      "Perintah OUTPUT (sering juga ditulis PRINT atau DISPLAY) mencetak nilai variabel atau pesan hasil ke layar.",
    hint: "Cari perintah yang berfungsi menampilkan hasil akhir ke layar pengguna.",
  },
  {
    id: "ifelse",
    name: "IF-ELSE",
    syntax: "IF skor >= 75 THEN\n  OUTPUT \"Lulus\"\nELSE\n  OUTPUT \"Ulang\"",
    functionDesc: "Menjalankan percabangan keputusan berdasarkan kondisi tertentu.",
    explanation:
      "Struktur IF-ELSE memeriksa apakah suatu syarat bernilai benar (THEN) atau salah (ELSE) untuk menentukan blok perintah yang dijalankan.",
    hint: "Struktur ini digunakan ketika algoritma harus memilih salah satu dari dua jalur kondisi.",
  },
  {
    id: "while",
    name: "WHILE",
    syntax: "WHILE count < 5 DO\n  count = count + 1\nENDWHILE",
    functionDesc: "Menjalankan perulangan instruksi selama kondisi yang diuji masih terpenuhi.",
    explanation:
      "Struktur WHILE mengulang blok perintah secara terus-menerus selama syarat kondisi bernilai benar (True) dan berhenti saat kondisi salah.",
    hint: "Cari struktur kontrol yang melakukan pengulangan (looping) berbasis kondisi.",
  },
  {
    id: "end",
    name: "END",
    syntax: "  // proses selesai\nEND",
    functionDesc: "Menandakan berakhirnya seluruh rangkaian instruksi algoritma.",
    explanation:
      "Perintah END diletakkan pada bagian akhir pseudocode sebagai penutup resmi bahwa seluruh langkah algoritma telah selesai.",
    hint: "Perintah penutup yang menjadi pasangan dari START di akhir algoritma.",
  },
];