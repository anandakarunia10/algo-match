export const FLOWCHART_INTRO = {
  title: "Pengertian & Fungsi Flowchart",
  definition:
    "Flowchart (diagram alir) adalah bagan yang menggambarkan urutan langkah-langkah logis dan aliran proses dari suatu algoritma menggunakan simbol-simbol geometris standar.",
  purpose:
    "Mempermudah perancangan logika program, memvisualisasikan alur keputusan, serta membantu komunikasi antar-pengembang sebelum menulis kode program.",
};

export const FLOWCHART_DATA = [
  {
    id: "terminator",
    name: "TERMINATOR",
    shape: "Oval / Persegi Panjang Sudut Membulat",
    functionDesc: "Menunjukkan awal (Start) dan akhir (End) dari suatu proses atau algoritma.",
    explanation:
      "Simbol Terminator selalu berada di titik paling awal dan paling akhir diagram alir untuk menandai batas dimulainya serta berhentinya suatu algoritma.",
    hint: "Perhatikan bentuk oval/kapsul membulat yang menandai titik mulai dan berhenti.",
    svg: `
      <svg width="78" height="40" viewBox="0 0 78 40" fill="none">
        <rect x="4" y="5" width="70" height="30" rx="15" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.4"/>
      </svg>
    `,
  },
  {
    id: "process",
    name: "PROCESS",
    shape: "Persegi Panjang",
    functionDesc: "Menunjukkan langkah pemrosesan, perhitungan, atau instruksi yang dilakukan.",
    explanation:
      "Simbol Process berbentuk persegi panjang digunakan untuk menyatakan operasi pengolahan data, perhitungan aritmetika, atau pemberian nilai variabel.",
    hint: "Cari simbol berbentuk persegi panjang standar yang mewakili aktivitas pemrosesan data.",
    svg: `
      <svg width="78" height="40" viewBox="0 0 78 40" fill="none">
        <rect x="6" y="6" width="66" height="28" rx="3" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.4"/>
      </svg>
    `,
  },
  {
    id: "decision",
    name: "DECISION",
    shape: "Belah Ketupat",
    functionDesc: "Menunjukkan pengambilan keputusan atau percabangan berdasarkan kondisi tertentu.",
    explanation:
      "Simbol Decision berbentuk belah ketupat mengevaluasi kondisi logika (Ya/Tidak atau True/False) untuk menentukan jalur aliran berikutnya.",
    hint: "Simbol percabangan memiliki bentuk belah ketupat dengan dua cabang keluaran.",
    svg: `
      <svg width="78" height="44" viewBox="0 0 78 44" fill="none">
        <polygon points="39,3 73,22 39,41 5,22" fill="#FEF9C3" stroke="#2563EB" stroke-width="2.4"/>
      </svg>
    `,
  },
  {
    id: "io",
    name: "INPUT / OUTPUT",
    shape: "Jajar Genjang",
    functionDesc: "Menunjukkan proses menerima masukan data atau menghasilkan keluaran informasi.",
    explanation:
      "Simbol Input/Output berbentuk jajar genjang mewakili proses pembacaan data dari pengguna (input) maupun penampilan hasil ke layar (output).",
    hint: "Simbol ini berbentuk segi empat miring (jajar genjang).",
    svg: `
      <svg width="78" height="40" viewBox="0 0 78 40" fill="none">
        <polygon points="18,6 72,6 60,34 6,34" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.4"/>
      </svg>
    `,
  },
  {
    id: "flowline",
    name: "FLOWLINE",
    shape: "Garis dengan Tanda Panah",
    functionDesc: "Menunjukkan arah aliran atau urutan langkah eksekusi dalam Flowchart.",
    explanation:
      "Flowline menghubungkan satu simbol ke simbol lainnya sekaligus menunjukkan arah urutan jalannya proses dari awal hingga akhir.",
    hint: "Cari simbol berupa garis lurus yang memiliki ujung tanda panah penunjuk arah.",
    svg: `
      <svg width="78" height="40" viewBox="0 0 78 40" fill="none">
        <line x1="8" y1="20" x2="62" y2="20" stroke="#2563EB" stroke-width="2.8" stroke-linecap="round"/>
        <polygon points="71,20 58,13 58,27" fill="#2563EB"/>
      </svg>
    `,
  },
  {
    id: "connector",
    name: "CONNECTOR",
    shape: "Lingkaran Kecil",
    functionDesc: "Menghubungkan bagian-bagian Flowchart yang terpisah pada halaman yang sama.",
    explanation:
      "Simbol Connector berbentuk lingkaran kecil mencegah garis penghubung saling bertumpuk dengan memberi label penghubung antarbagian diagram.",
    hint: "Simbol penghubung halaman ini berbentuk lingkaran kecil sederhana.",
    svg: `
      <svg width="78" height="40" viewBox="0 0 78 40" fill="none">
        <circle cx="39" cy="20" r="14" fill="#FEF9C3" stroke="#2563EB" stroke-width="2.4"/>
      </svg>
    `,
  },
];