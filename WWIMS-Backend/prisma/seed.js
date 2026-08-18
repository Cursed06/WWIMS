import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_ITEMS = [
  {
    "waste_type_id": "BB-01",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "PET Campur",
    "description": "PET kondisi tercampur dari Nop 1 sd 13",
    "unit": "kg",
    "buy_price": 600.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BB-02",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "PET Kotor",
    "description": "PET botol plastik Aqua, Fanta, Ades, Pocari",
    "unit": "kg",
    "buy_price": 1000.0,
    "sell_price": 1200.0
  },
  {
    "waste_type_id": "BB-03",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "PET Bersih",
    "description": "PET kondisi bersih tanpa tutup dan label",
    "unit": "kg",
    "buy_price": 2000.0,
    "sell_price": 2500.0
  },
  {
    "waste_type_id": "BB-04",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "PET Warna Bersih",
    "description": "PET Warna kondisi Bersih tanpa tutup dan label",
    "unit": "kg",
    "buy_price": 1000.0,
    "sell_price": 1200.0
  },
  {
    "waste_type_id": "BB-05",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Gelas Kotor",
    "description": "Aqua Gelas sejenis masih ada labelnya",
    "unit": "kg",
    "buy_price": 1000.0,
    "sell_price": 1300.0
  },
  {
    "waste_type_id": "BB-06",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Gelas Bersih",
    "description": "Aqua Gelas sejenis kondisi bersih tanpa label",
    "unit": "kg",
    "buy_price": 2000.0,
    "sell_price": 2500.0
  },
  {
    "waste_type_id": "BB-07",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Ale-Ale, Mountea, Teh Gelas",
    "description": "Ale-Ale, Mountea, Teh Gelas",
    "unit": "kg",
    "buy_price": 800.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BB-08",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Putihan",
    "description": "Botol Oli, Shampo, Sabun Cair, Sejenis",
    "unit": "kg",
    "buy_price": 1600.0,
    "sell_price": 1800.0
  },
  {
    "waste_type_id": "BB-09",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Jerigen 5 Liter (/pcs)",
    "description": "Kondisi bersih dan utuh dengan tutupnya",
    "unit": "biji",
    "buy_price": 500.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BB-10",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Jerigen 18 Liter (/pcs)",
    "description": "Kondisi bersih dan utuh dengan tutupnya",
    "unit": "biji",
    "buy_price": 4500.0,
    "sell_price": 5000.0
  },
  {
    "waste_type_id": "BB-11",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Tutup PET / Tutup galon",
    "description": "Tutup PET dan galon pada umumnya",
    "unit": "kg",
    "buy_price": 2000.0,
    "sell_price": 2500.0
  },
  {
    "waste_type_id": "BB-12",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Emberan",
    "description": "Emberan yang sifatnya lentur di luar warna hitam",
    "unit": "kg",
    "buy_price": 500.0,
    "sell_price": 700.0
  },
  {
    "waste_type_id": "BB-13",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Kerasan",
    "description": "Kerasan, paralon, yakult, galon Le Minerale",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BB-14",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Kresek",
    "description": "Plastik lembaran warna-warni",
    "unit": "kg",
    "buy_price": 200.0,
    "sell_price": 300.0
  },
  {
    "waste_type_id": "BB-15",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Plastik Bening",
    "description": "Plastik bening yang sifatnya elastis",
    "unit": "kg",
    "buy_price": 500.0,
    "sell_price": 600.0
  },
  {
    "waste_type_id": "BB-16",
    "vendor_id": "V-BB",
    "category_id": "CAT-PL",
    "waste_name": "Multi Layer",
    "description": "Sachet dengan lapisan alumunium bersih dan kering",
    "unit": "kg",
    "buy_price": 25.0,
    "sell_price": 50.0
  },
  {
    "waste_type_id": "BB-17",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Kardus",
    "description": "Kardus pada umumnya kering",
    "unit": "kg",
    "buy_price": 1300.0,
    "sell_price": 1500.0
  },
  {
    "waste_type_id": "BB-18",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Kertas HVS/Cetak",
    "description": "Kertas berwarna putih kering",
    "unit": "kg",
    "buy_price": 1600.0,
    "sell_price": 1900.0
  },
  {
    "waste_type_id": "BB-19",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Buku Tulis, Pelajaran, LKS",
    "description": "Buku tulis, pelajaran pada umumnya",
    "unit": "kg",
    "buy_price": 800.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BB-20",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Kertas CD/Buram, Tabloid",
    "description": "Kertas CD / berwarna buram",
    "unit": "kg",
    "buy_price": 800.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BB-21",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Majalah",
    "description": "Majalah pada umumnya kering",
    "unit": "kg",
    "buy_price": 500.0,
    "sell_price": 700.0
  },
  {
    "waste_type_id": "BB-22",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Duplek",
    "description": "Kertas pembungkus kemasan",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 600.0
  },
  {
    "waste_type_id": "BB-23",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Arsip",
    "description": "Kertas warna warni",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 600.0
  },
  {
    "waste_type_id": "BB-24",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Tetra Pack",
    "description": "Pembungkus Teh kotak, Sun kara, Susu Kotak",
    "unit": "kg",
    "buy_price": 100.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BB-25",
    "vendor_id": "V-BB",
    "category_id": "CAT-KE",
    "waste_name": "Koran",
    "description": "Kondisi bersih rapi kering",
    "unit": "kg",
    "buy_price": 5000.0,
    "sell_price": 5500.0
  },
  {
    "waste_type_id": "BB-26",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Alumunium Tebal/ Panci",
    "description": "Panci, wajan, jemuran, sejenis berbahan Alumunium",
    "unit": "kg",
    "buy_price": 10000.0,
    "sell_price": 11000.0
  },
  {
    "waste_type_id": "BB-27",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Alumunium Tipis/ Kaleng",
    "description": "Kaleng soda sejenis berbahan Alumunium",
    "unit": "kg",
    "buy_price": 9000.0,
    "sell_price": 10000.0
  },
  {
    "waste_type_id": "BB-28",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Besi Tebal",
    "description": "Besi kondisi tebal dan berat",
    "unit": "kg",
    "buy_price": 3000.0,
    "sell_price": 3200.0
  },
  {
    "waste_type_id": "BB-29",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Besi Tipis",
    "description": "Besi kondisi tipis cenderung ringan",
    "unit": "kg",
    "buy_price": 1800.0,
    "sell_price": 2000.0
  },
  {
    "waste_type_id": "BB-30",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Tembaga",
    "description": "Kabel listrik berbahan Tembaga berwarna cokelat",
    "unit": "kg",
    "buy_price": 75000.0,
    "sell_price": 80000.0
  },
  {
    "waste_type_id": "BB-31",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Seng",
    "description": "Seng pada umumnya",
    "unit": "kg",
    "buy_price": 800.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BB-32",
    "vendor_id": "V-BB",
    "category_id": "CAT-LO",
    "waste_name": "Omplong",
    "description": "Kaleng cat, biscuit, Baygon, Bear Brand",
    "unit": "kg",
    "buy_price": 1500.0,
    "sell_price": 1800.0
  },
  {
    "waste_type_id": "BB-33",
    "vendor_id": "V-BB",
    "category_id": "CAT-KA",
    "waste_name": "Bir Besar",
    "description": "Botol bir kondisi bersih masih ada labelnya",
    "unit": "kg",
    "buy_price": 700.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BB-34",
    "vendor_id": "V-BB",
    "category_id": "CAT-KA",
    "waste_name": "Bir Kecil",
    "description": "Botol bir kondisi bersih masih ada labelnya",
    "unit": "kg",
    "buy_price": 300.0,
    "sell_price": 400.0
  },
  {
    "waste_type_id": "BB-35",
    "vendor_id": "V-BB",
    "category_id": "CAT-KA",
    "waste_name": "Bir Singaraja Besar",
    "description": "Botol Bir Singaraja Kondisi bersih",
    "unit": "kg",
    "buy_price": 300.0,
    "sell_price": 400.0
  },
  {
    "waste_type_id": "BB-36",
    "vendor_id": "V-BB",
    "category_id": "CAT-KA",
    "waste_name": "Draft Besar",
    "description": "Botol Bir Draft kondisi bersih, utuh, masih ada labelnya",
    "unit": "kg",
    "buy_price": 500.0,
    "sell_price": 600.0
  },
  {
    "waste_type_id": "BB-37",
    "vendor_id": "V-BB",
    "category_id": "CAT-KA",
    "waste_name": "Bening Putih",
    "description": "Botol bening tanpa warna",
    "unit": "kg",
    "buy_price": 50.0,
    "sell_price": 75.0
  },
  {
    "waste_type_id": "BB-38",
    "vendor_id": "V-BB",
    "category_id": "CAT-KA",
    "waste_name": "Warna Campur",
    "description": "Botol bening berwana",
    "unit": "kg",
    "buy_price": 25.0,
    "sell_price": 50.0
  },
  {
    "waste_type_id": "BB-39",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Accu/Aki",
    "description": "Accu/Aki tanpa air",
    "unit": "kg",
    "buy_price": 6000.0,
    "sell_price": 6500.0
  },
  {
    "waste_type_id": "BB-40",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Spon/Sepatu Sandal Bekas",
    "description": "Spons sepatu bekas (kecuali sandal jepit)",
    "unit": "kg",
    "buy_price": 100.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BB-41",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Elektronik Bekas",
    "description": "Elektronik Bekas yang berkaitan dengan Listrik",
    "unit": "kg",
    "buy_price": 500.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BB-42",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Dinamo",
    "description": "Dinamo penggerak mesin",
    "unit": "kg",
    "buy_price": 3500.0,
    "sell_price": 4000.0
  },
  {
    "waste_type_id": "BB-43",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Kerat Telur",
    "description": "Kerat telur kondisi utuh dan bagus (harus diikat rapi)",
    "unit": "kg",
    "buy_price": 100.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BB-44",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Styrofoam",
    "description": "Styrofoam packing",
    "unit": "kg",
    "buy_price": 100.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BB-47",
    "vendor_id": "V-BB",
    "category_id": "CAT-LA",
    "waste_name": "Minyak Goreng Bekas",
    "description": "Minyak Goreng Bekas terpilah bersih.",
    "unit": "kg",
    "buy_price": 4000.0,
    "sell_price": 4500.0
  },
  {
    "waste_type_id": "BWC-01",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Rongsok Campur",
    "description": "Campuran plastik kemasan berbentuk dan kaleng  (bukan kresek/plastik lembaran)",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BWC-02",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PET Kotor",
    "description": "Botol dan gelas minum yang masih berlabel tutup (tanpa air/isi)",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BWC-03",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PET KW 2",
    "description": "Botol minyak, botol saos sejenis kotor bekas penggunaan",
    "unit": "kg",
    "buy_price": 300.0,
    "sell_price": 400.0
  },
  {
    "waste_type_id": "BWC-04",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PET Bersih Bening",
    "description": "Botol air mineral bening tanpa label & tutup (Ades, Club, Vit Sejenis)",
    "unit": "kg",
    "buy_price": 2800.0,
    "sell_price": 3000.0
  },
  {
    "waste_type_id": "BWC-05",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PET Bersih Biru Muda",
    "description": "Botol air mineral Biru Muda tanpa label (Aqua, Le Minerale)",
    "unit": "kg",
    "buy_price": 2400.0,
    "sell_price": 2500.0
  },
  {
    "waste_type_id": "BWC-06",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PET Bersih Warna",
    "description": "Botol warna tanpa label & tutup (Mizone, Sprite), Tidak termasuk PET putih (Milku)",
    "unit": "kg",
    "buy_price": 700.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BWC-07",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PET Bersih Campur",
    "description": "Botol campur bening dan biru muda tanpa label dan tutup",
    "unit": "kg",
    "buy_price": 1600.0,
    "sell_price": 1700.0
  },
  {
    "waste_type_id": "BWC-08",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Putihan (HDPE & jenis lainnya)",
    "description": "Botol kosmetik (botol shampo, sabun cair, bedak, botol oli, dll) TANPA ISI",
    "unit": "kg",
    "buy_price": 1800.0,
    "sell_price": 2000.0
  },
  {
    "waste_type_id": "BWC-09",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Jerigen Bening bersih/Jerigen minyak",
    "description": "Jerigen warna bening seperti jerigen minyak, alkohol, sabun, pewangi, kecap,dll TANPA ISI",
    "unit": "kg",
    "buy_price": 2400.0,
    "sell_price": 2500.0
  },
  {
    "waste_type_id": "BWC-10",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Jerigen warna/bening tapi mangkak",
    "description": "Jerigen oli, dll yang berwarna TANPA ISI",
    "unit": "kg",
    "buy_price": 1900.0,
    "sell_price": 2000.0
  },
  {
    "waste_type_id": "BWC-11",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Tutup PET (HDPE)",
    "description": "Tutup botol Aqua, Vit, Pocari, Sprite, dll",
    "unit": "kg",
    "buy_price": 1800.0,
    "sell_price": 2000.0
  },
  {
    "waste_type_id": "BWC-12",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Tutup Galon (LDPE)",
    "description": "Tutup galon air mineral/isi ulang",
    "unit": "kg",
    "buy_price": 1700.0,
    "sell_price": 1800.0
  },
  {
    "waste_type_id": "BWC-13",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Tutup campur",
    "description": "Tutup HD, LD, PP Campur",
    "unit": "kg",
    "buy_price": 0.0,
    "sell_price": 0.0
  },
  {
    "waste_type_id": "BWC-14",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PP Emberan Campur",
    "description": "Jika tercampur hitam ikut harga emberan hitam",
    "unit": "kg",
    "buy_price": 900.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BWC-15",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PP Emberan warna",
    "description": "Semua warna kecuali hitam, perabotan RT, piring plastik, meja plastik, kursi plastik, baskom, sikat gigi, sisir (lebih keras dan tipis)",
    "unit": "kg",
    "buy_price": 900.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BWC-16",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PP Emberan Hitam",
    "description": "Semua emberan warna hitam (pot bunga, hanger hitam, timba hitam, body hitam, dll)",
    "unit": "kg",
    "buy_price": 900.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BWC-17",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PC Galon UTUH (/biji)",
    "description": "Galon air minuman semua merk kondisi utuh kecuali galon cleo",
    "unit": "biji",
    "buy_price": 1300.0,
    "sell_price": 1500.0
  },
  {
    "waste_type_id": "BWC-18",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PC Galon PECAH (/Kg)",
    "description": "Galon air minuman semua merk kondisi pecah",
    "unit": "kg",
    "buy_price": 800.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BWC-19",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Aqua Gelas Kotor",
    "description": "PP Gelas masih berlabel dan belum di lepas ringnya (Aqua, club)  TANPA AIR",
    "unit": "kg",
    "buy_price": 1100.0,
    "sell_price": 1200.0
  },
  {
    "waste_type_id": "BWC-20",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Aqua Gelas Bersih",
    "description": "PP Gelas BERSIH TANPA Label dan tutup",
    "unit": "kg",
    "buy_price": 1900.0,
    "sell_price": 2000.0
  },
  {
    "waste_type_id": "BWC-21",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Mountea/Sablon",
    "description": "Gelas putih dan bening sablon masih berlabel dan tutup (Mountea, Ale-Ale, Teh Gelas, Teh Rio, Chatime, dll) TANPA AIR",
    "unit": "kg",
    "buy_price": 900.0,
    "sell_price": 1000.0
  },
  {
    "waste_type_id": "BWC-22",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Plastik Bening PE & PP",
    "description": "Plastik kantong bening tanpa label",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BWC-23",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "HD Kresek",
    "description": "Kantong plastik kresek semua warna, polos (non sablon)",
    "unit": "kg",
    "buy_price": 50.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-24",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Kresek Campur",
    "description": "Plastik yang masih tercampur TANPA MULTILAYER",
    "unit": "kg",
    "buy_price": 50.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-25",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "LLDPE Pouch/Single Layer",
    "description": "Kemasan minyak goreng, sabun cuci cair, sabun cuci piring, kemasan kispray, shampoo refill, dll",
    "unit": "kg",
    "buy_price": 40.0,
    "sell_price": 50.0
  },
  {
    "waste_type_id": "BWC-26",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PP Sablon lembaran",
    "description": "Bungkus mie instan, roti kue, diaper/popok (yang tidak ada lapisan foil)",
    "unit": "kg",
    "buy_price": 40.0,
    "sell_price": 50.0
  },
  {
    "waste_type_id": "BWC-27",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Multi Layer",
    "description": "Sachet makanan ringan/snack, sachet kopi (ada lapisan aluminium)",
    "unit": "kg",
    "buy_price": 250.0,
    "sell_price": 300.0
  },
  {
    "waste_type_id": "BWC-28",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "Kerasan/PS/ABS",
    "description": "Tempat kaset, rak kulkas, toples kue sendok bening, kaca helm, tumbler, body korek gas, dll",
    "unit": "kg",
    "buy_price": 75.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-29",
    "vendor_id": "V-BWC",
    "category_id": "CAT-PL",
    "waste_name": "PVC",
    "description": "Pipa, paralon semua warna, pintu plastik, talang air, dll)",
    "unit": "kg",
    "buy_price": 50.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-30",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Buku Tulis/Buku Pelajaran",
    "description": "Semua buku tulis dan pelajaran putih/cetak",
    "unit": "kg",
    "buy_price": 1100.0,
    "sell_price": 1200.0
  },
  {
    "waste_type_id": "BWC-31",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "HVS",
    "description": "Kertas HVS dengan atau tanpa tulisan atau buku cetakan kertas putih",
    "unit": "kg",
    "buy_price": 1100.0,
    "sell_price": 1200.0
  },
  {
    "waste_type_id": "BWC-32",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Kertas Buram/LKS/warna",
    "description": "Isi dalam LKS, kertas nota, kertas coklat",
    "unit": "kg",
    "buy_price": 450.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BWC-33",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Majalah",
    "description": "Kertas art paper mengkilap (majalah, brosur, poster)",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BWC-34",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Koran",
    "description": "Rapi dan bersih",
    "unit": "kg",
    "buy_price": 1800.0,
    "sell_price": 2000.0
  },
  {
    "waste_type_id": "BWC-35",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Duplek",
    "description": "Semua kertas tebal berwarna (map, cover buku/majalah, bungkus rokok, kotak makanan, snack, kotak obat, kotak odol, bungkus sabun, kotak susu, dll)",
    "unit": "kg",
    "buy_price": 75.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-36",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Kardus",
    "description": "Kardus kering berongga",
    "unit": "kg",
    "buy_price": 700.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BWC-37",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KE",
    "waste_name": "Kertas Campur",
    "description": "Campur buku, HVS, Majalah, tabloid, koran",
    "unit": "kg",
    "buy_price": 75.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-38",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Besi Kaleng (Omplong)",
    "description": "Kaleng susu, Khong Guan, Monde, Bear Brand, kaleng Baygon, cat, dll",
    "unit": "kg",
    "buy_price": 1000.0,
    "sell_price": 1500.0
  },
  {
    "waste_type_id": "BWC-39",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Besi B (Tipis)",
    "description": "Kabin, plat tipis kendaraan, kompor bekas, Argo, dll",
    "unit": "kg",
    "buy_price": 1100.0,
    "sell_price": 1200.0
  },
  {
    "waste_type_id": "BWC-40",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Besi A (Tebal & Padat)",
    "description": "Besi batangan dan padat, ranjang, pipa, plat, beton, baut, linggis dll",
    "unit": "kg",
    "buy_price": 2300.0,
    "sell_price": 2500.0
  },
  {
    "waste_type_id": "BWC-41",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Seng/paku",
    "description": "Segala jenis seng, kawat, payung, paku",
    "unit": "kg",
    "buy_price": 200.0,
    "sell_price": 300.0
  },
  {
    "waste_type_id": "BWC-42",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Aluminium Kaleng/tipis",
    "description": "Kaleng minuman, mudah diremas (Coca-cola, Sprite, Larutan, Bintang, Pocari, Adem Sari)",
    "unit": "kg",
    "buy_price": 4500.0,
    "sell_price": 5000.0
  },
  {
    "waste_type_id": "BWC-43",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Aluminium Tebal",
    "description": "Siku, body panci tebal, dll (padat dan berat)",
    "unit": "kg",
    "buy_price": 6500.0,
    "sell_price": 7000.0
  },
  {
    "waste_type_id": "BWC-44",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Tembaga",
    "description": "Tembaga terpilah bersih.",
    "unit": "kg",
    "buy_price": 28000.0,
    "sell_price": 30000.0
  },
  {
    "waste_type_id": "BWC-45",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LO",
    "waste_name": "Logam Campur",
    "description": "Logam Campur",
    "unit": "kg",
    "buy_price": 0.0,
    "sell_price": 0.0
  },
  {
    "waste_type_id": "BWC-46",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KA",
    "waste_name": "Botol Bir Bintang Besar (/biji)",
    "description": "Botol bir dengan label masih bagus",
    "unit": "biji",
    "buy_price": 700.0,
    "sell_price": 800.0
  },
  {
    "waste_type_id": "BWC-47",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KA",
    "waste_name": "Botol Bir Bintang Kecil (/biji)",
    "description": "Botol bir dengan label masih bagus",
    "unit": "biji",
    "buy_price": 150.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BWC-48",
    "vendor_id": "V-BWC",
    "category_id": "CAT-KA",
    "waste_name": "Botol Kaca Campur",
    "description": "Bening dan berwarna, botol minuman YouC1000, botol sirup, selai, minyak wangi, Kratingdaeng, botol kecap, saos, beling/pecahan botol, kecuali cermin",
    "unit": "kg",
    "buy_price": 50.0,
    "sell_price": 100.0
  },
  {
    "waste_type_id": "BWC-49",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Styrofoam Bersih",
    "description": "Lembaran, keras, balok, styrofoam tempat makan yang sudah terlepas dari stiker, kertas nasi dan isolasi",
    "unit": "kg",
    "buy_price": 150.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BWC-50",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Net & PE Foam",
    "description": "Jaring buah/net foam, PE foam/lembaran foam wadah buah, bubble wrap",
    "unit": "kg",
    "buy_price": 0.0,
    "sell_price": 0.0
  },
  {
    "waste_type_id": "BWC-51",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Tetra Pack",
    "description": "Kemasan minuman dalam kertas, Teh Kotak, kotak susu, dll",
    "unit": "kg",
    "buy_price": 150.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BWC-52",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Accu per kg",
    "description": "Sudah tidak ada airnya",
    "unit": "kg",
    "buy_price": 0.0,
    "sell_price": 0.0
  },
  {
    "waste_type_id": "BWC-53",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Sponge/Sepatu/Sandal Bekas",
    "description": "Jenis kulit BUKAN karet BUKAN spons",
    "unit": "kg",
    "buy_price": 0.0,
    "sell_price": 0.0
  },
  {
    "waste_type_id": "BWC-54",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Tray Telur",
    "description": "Yang masih bagus",
    "unit": "kg",
    "buy_price": 150.0,
    "sell_price": 200.0
  },
  {
    "waste_type_id": "BWC-55",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Yakult",
    "description": "Yakult terpilah bersih.",
    "unit": "kg",
    "buy_price": 450.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "BWC-56",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Kulit kabel",
    "description": "Tanpa isi",
    "unit": "kg",
    "buy_price": 200.0,
    "sell_price": 300.0
  },
  {
    "waste_type_id": "BWC-57",
    "vendor_id": "V-BWC",
    "category_id": "CAT-LA",
    "waste_name": "Boncos/Karung Beras",
    "description": "Karung bekas beras / kampil rusak",
    "unit": "kg",
    "buy_price": 400.0,
    "sell_price": 500.0
  },
  {
    "waste_type_id": "MO-01",
    "vendor_id": "V-MO",
    "category_id": "CAT-JE",
    "waste_name": "Minyak Goreng Bekas (Jelantah)",
    "description": "Minyak goreng bekas pakai dalam kondisi wadah tertutup rapat.",
    "unit": "liter",
    "buy_price": 4000.0,
    "sell_price": 4500.0
  }
];

async function main() {
  console.log('Seeding database with updated Excel data...');

  // 1. Seed POS
  const posData = [
    { pos_id: 'DL', pos_name: 'Dalung', address: 'Dalung, Kuta Utara' },
    { pos_id: 'PP', pos_name: 'Penamparan', address: 'Penamparan, Denpasar Barat' },
    { pos_id: 'MM', pos_name: 'Monang Maning', address: 'Monang Maning, Denpasar Barat' },
    { pos_id: 'BA', pos_name: 'Baliarum', address: 'Baliarum, Denpasar Timur' },
    { pos_id: 'KH', pos_name: 'Kertha Raharja', address: 'Kertha Raharja, Denpasar' },
    { pos_id: 'GE', pos_name: 'GPIB Ekklesia', address: 'GPIB Ekklesia, Kuta' }
  ];

  for (const pos of posData) {
    await prisma.pOS.upsert({
      where: { pos_id: pos.pos_id },
      update: {},
      create: pos
    });
  }
  console.log('Seed POS complete.');

  // 2. Seed Vendors
  const vendors = [
    { vendor_id: 'V-BB', vendor_name: 'Bali Bersih', contact: '08123456789' },
    { vendor_id: 'V-BWC', vendor_name: 'Bali Waste Cycle', contact: '08765432109' },
    { vendor_id: 'V-MO', vendor_name: 'Metro Oil', contact: '08999888777' }
  ];

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { vendor_id: vendor.vendor_id },
      update: {},
      create: vendor
    });
  }
  console.log('Seed Vendors complete.');

  // 3. Seed POS-Vendor Associations
  const posVendors = [
    { pos_id: 'DL', vendor_id: 'V-BB' },
    { pos_id: 'DL', vendor_id: 'V-MO' },
    { pos_id: 'PP', vendor_id: 'V-BWC' },
    { pos_id: 'PP', vendor_id: 'V-MO' },
    { pos_id: 'MM', vendor_id: 'V-BB' },
    { pos_id: 'MM', vendor_id: 'V-MO' },
    { pos_id: 'BA', vendor_id: 'V-BB' },
    { pos_id: 'BA', vendor_id: 'V-MO' },
    { pos_id: 'KH', vendor_id: 'V-BWC' },
    { pos_id: 'KH', vendor_id: 'V-MO' },
    { pos_id: 'GE', vendor_id: 'V-BWC' },
    { pos_id: 'GE', vendor_id: 'V-MO' }
  ];

  for (const pv of posVendors) {
    await prisma.posVendor.upsert({
      where: { pos_id_vendor_id: { pos_id: pv.pos_id, vendor_id: pv.vendor_id } },
      update: {},
      create: pv
    });
  }
  console.log('Seed POS-Vendor associations complete.');

  // 4. Seed Waste Categories
  const categories = [
    { category_id: 'CAT-PL', category_name: 'Plastik' },
    { category_id: 'CAT-KE', category_name: 'Kertas' },
    { category_id: 'CAT-LO', category_name: 'Logam' },
    { category_id: 'CAT-KA', category_name: 'Kaca' },
    { category_id: 'CAT-LA', category_name: 'Lainnya' },
    { category_id: 'CAT-JE', category_name: 'Jelantah' }
  ];

  for (const cat of categories) {
    await prisma.wasteCategory.upsert({
      where: { category_id: cat.category_id },
      update: { category_name: cat.category_name },
      create: cat
    });
  }
  console.log('Seed Waste Categories complete.');

  // 5. Seed Waste Types and Prices
  for (const item of SEED_ITEMS) {
    await prisma.wasteType.upsert({
      where: { waste_type_id: item.waste_type_id },
      update: {
        waste_name: item.waste_name,
        description: item.description,
        category_id: item.category_id,
        vendor_id: item.vendor_id,
        unit: item.unit
      },
      create: {
        waste_type_id: item.waste_type_id,
        vendor_id: item.vendor_id,
        category_id: item.category_id,
        waste_name: item.waste_name,
        description: item.description,
        unit: item.unit
      }
    });

    await prisma.vendorPrice.upsert({
      where: {
        vendor_id_waste_type_id: {
          vendor_id: item.vendor_id,
          waste_type_id: item.waste_type_id
        }
      },
      update: {
        buy_price: item.buy_price,
        sell_price: item.sell_price
      },
      create: {
        vendor_id: item.vendor_id,
        waste_type_id: item.waste_type_id,
        buy_price: item.buy_price,
        sell_price: item.sell_price
      }
    });
  }
  console.log('Seed Waste Types and Prices complete.');

  // 6. Seed Simulation Users
  const users = [
    {
      user_id: 'admin-pusat',
      username: 'pusat',
      password_hash: 'b/5JzPqG62xKx.8p2W02y7.81vO18e', // 'admin123'
      role: 'ADMIN_PUSAT',
      pos_id: null
    },
    {
      user_id: 'admin-pos-ba',
      username: 'pos_ba',
      password_hash: 'b/5JzPqG62xKx.8p2W02y7.81vO18e',
      role: 'ADMIN_POS',
      pos_id: 'BA'
    },
    {
      user_id: 'admin-pos-dl',
      username: 'pos_dl',
      password_hash: 'b/5JzPqG62xKx.8p2W02y7.81vO18e',
      role: 'ADMIN_POS',
      pos_id: 'DL'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { user_id: user.user_id },
      update: {},
      create: user
    });
  }

  // 7. Seed Sample Nasabahs for POS BA
  const sampleNasabahs = [
    { customer_id: 'WW-BA-0041', pos_id: 'BA', name: 'Siti Rahayu', address: 'Jl. Melati No. 12, RT 03', balance: 87500 },
    { customer_id: 'WW-BA-0027', pos_id: 'BA', name: 'Budi Wahyono', address: 'Jl. Mawar No. 5, RT 01', balance: 124000 },
    { customer_id: 'WW-BA-0088', pos_id: 'BA', name: 'Murti Astuti', address: 'Jl. Anggrek No. 8, RT 07', balance: 42000 },
    { customer_id: 'WW-BA-0013', pos_id: 'BA', name: 'Dewi Hapsari', address: 'Jl. Kenanga No. 3, RT 04', balance: 215000 },
    { customer_id: 'WW-BA-0076', pos_id: 'BA', name: 'Putri Ningrum', address: 'Jl. Dahlia No. 2, RT 02', balance: 0, is_active: false },
    { customer_id: 'WW-BA-0142', pos_id: 'BA', name: 'Hani Lestari', address: 'Jl. Tulip No. 7, RT 05', balance: 0 },
    { customer_id: 'WW-BA-0109', pos_id: 'BA', name: 'Rudi Santoso', address: 'Jl. Flamboyan No. 4, RT 06', balance: 57000 }
  ];

  for (const n of sampleNasabahs) {
    await prisma.nasabah.upsert({
      where: { customer_id: n.customer_id },
      update: { balance: n.balance },
      create: n
    });
  }
  // 8. Seed Rich Multi-Month Historical Transactions & Withdrawals
  console.log('Clearing previous transactions, details, withdrawals, and audit logs...');
  await prisma.detailPenimbangan.deleteMany({});
  await prisma.transaksiPenimbangan.deleteMany({});
  await prisma.transaksiPenarikan.deleteMany({});
  await prisma.auditLog.deleteMany({});

  console.log('Seeding Multi-Month Historical Transactions & Withdrawals...');

  const sampleNasabahList = ['WW-BA-0041', 'WW-BA-0027', 'WW-BA-0088', 'WW-BA-0013', 'WW-BA-0109', 'WW-BA-0142'];

  const sampleItemsPool = [
    { waste_type_id: 'BB-01', vendor_id: 'V-BB', buy: 600, sell: 800, unit: 'kg' },   // Plastik
    { waste_type_id: 'BB-03', vendor_id: 'V-BB', buy: 2000, sell: 2500, unit: 'kg' },  // Plastik
    { waste_type_id: 'BB-15', vendor_id: 'V-BB', buy: 1200, sell: 1600, unit: 'kg' },  // Kertas
    { waste_type_id: 'BB-20', vendor_id: 'V-BB', buy: 1500, sell: 2000, unit: 'kg' },  // Kertas
    { waste_type_id: 'BB-30', vendor_id: 'V-BB', buy: 75000, sell: 80000, unit: 'kg' },// Logam
    { waste_type_id: 'BB-32', vendor_id: 'V-BB', buy: 1500, sell: 1800, unit: 'kg' },  // Logam
    { waste_type_id: 'BB-33', vendor_id: 'V-BB', buy: 700, sell: 800, unit: 'kg' },   // Kaca
    { waste_type_id: 'BB-37', vendor_id: 'V-BB', buy: 50, sell: 75, unit: 'kg' },     // Kaca
    { waste_type_id: 'BB-41', vendor_id: 'V-BB', buy: 500, sell: 800, unit: 'kg' },   // Lainnya
    { waste_type_id: 'BB-47', vendor_id: 'V-BB', buy: 5000, sell: 6500, unit: 'liter' } // Minyak
  ];

  // Months from Sep 2024 to Aug 2026 (for rich trend data)
  const monthsConfig = [
    { year: 2024, month: 8, count: 12 },  // Sep 2024
    { year: 2024, month: 9, count: 15 },  // Oct 2024
    { year: 2024, month: 10, count: 18 }, // Nov 2024
    { year: 2024, month: 11, count: 16 }, // Dec 2024
    { year: 2025, month: 0, count: 22 },  // Jan 2025
    { year: 2025, month: 1, count: 25 },  // Feb 2025
    { year: 2026, month: 6, count: 18 },  // Jul 2026
    { year: 2026, month: 7, count: 24 }   // Aug 2026
  ];

  const currentDateLimit = new Date(2026, 7, 18, 12, 0); // Current date: 18 Aug 2026

  let txCounter = 0;
  for (const mCfg of monthsConfig) {
    const maxDayForMonth = (mCfg.year === 2026 && mCfg.month === 7) ? 18 : 28;
    for (let i = 0; i < mCfg.count; i++) {
      txCounter++;
      const day = Math.floor(Math.random() * maxDayForMonth) + 1;
      const hour = Math.floor(Math.random() * 8) + 8;
      const minute = Math.floor(Math.random() * 59);
      let txDate = new Date(mCfg.year, mCfg.month, day, hour, minute);
      if (txDate > currentDateLimit) {
        txDate = new Date(2026, 7, 18, 9, (i * 3) % 50);
      }

      const customerId = sampleNasabahList[i % sampleNasabahList.length];
      
      const item1 = sampleItemsPool[(i + txCounter) % sampleItemsPool.length];
      const item2 = sampleItemsPool[(i + txCounter + 3) % sampleItemsPool.length];
      
      const qty1 = parseFloat((Math.random() * 12 + 1).toFixed(1));
      const qty2 = parseFloat((Math.random() * 8 + 0.5).toFixed(1));

      const buySub1 = qty1 * item1.buy;
      const sellSub1 = qty1 * item1.sell;
      const buySub2 = qty2 * item2.buy;
      const sellSub2 = qty2 * item2.sell;

      const totalBuy = buySub1 + buySub2;
      const totalSell = sellSub1 + sellSub2;
      const margin = totalSell - totalBuy;
      const posProfit = margin * 0.7;
      const pusatProfit = margin * 0.3;

      const createdTx = await prisma.transaksiPenimbangan.create({
        data: {
          customer_id: customerId,
          pos_id: 'BA',
          transaction_date: txDate,
          total_buy_value: totalBuy,
          total_sell_value: totalSell,
          margin: margin,
          pos_profit: posProfit,
          pusat_profit: pusatProfit,
          nasabah_credit: totalBuy,
          created_by: 'admin-pos-ba',
          details: {
            create: [
              {
                waste_type_id: item1.waste_type_id,
                vendor_id: item1.vendor_id,
                quantity: qty1,
                unit: item1.unit,
                price_snapshot: item1.buy,
                sell_price_snapshot: item1.sell,
                subtotal: buySub1
              },
              {
                waste_type_id: item2.waste_type_id,
                vendor_id: item2.vendor_id,
                quantity: qty2,
                unit: item2.unit,
                price_snapshot: item2.buy,
                sell_price_snapshot: item2.sell,
                subtotal: buySub2
              }
            ]
          }
        }
      });

      const detailsSummary = `Penimbangan setoran ${qty1} ${item1.unit} & ${qty2} ${item2.unit} (Total Rp ${Math.round(totalBuy).toLocaleString('id-ID')}) untuk Nasabah ${customerId}`;

      // Also create a detailed audit log
      await prisma.auditLog.create({
        data: {
          action: 'DEPOSIT_WEIGHING',
          entity: 'TransaksiPenimbangan',
          entity_id: String(createdTx.transaction_id),
          details_summary: detailsSummary,
          timestamp: txDate,
          user_id: 'admin-pos-ba'
        }
      });
    }
  }

  // Seed Historical Withdrawals
  const withdrawalAmounts = [50000, 30000, 100000, 25000, 75000, 50000, 120000];
  for (let i = 0; i < 15; i++) {
    const mCfg = monthsConfig[i % monthsConfig.length];
    const maxDayForMonth = (mCfg.year === 2026 && mCfg.month === 7) ? 18 : 28;
    const day = Math.floor(Math.random() * maxDayForMonth) + 1;
    let wdDate = new Date(mCfg.year, mCfg.month, day, 10, 30);
    if (wdDate > currentDateLimit) {
      wdDate = new Date(2026, 7, 18, 8, 30);
    }
    const custId = sampleNasabahList[i % sampleNasabahList.length];
    const amt = withdrawalAmounts[i % withdrawalAmounts.length];

    const createdWd = await prisma.transaksiPenarikan.create({
      data: {
        customer_id: custId,
        pos_id: 'BA',
        amount: amt,
        proof_image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample_receipt.png',
        withdrawal_date: wdDate,
        created_by: 'admin-pos-ba'
      }
    });

    const wdDetailsSummary = `Pencairan saldo tabungan sebesar Rp ${amt.toLocaleString('id-ID')} untuk Nasabah ${custId}`;

    await prisma.auditLog.create({
      data: {
        action: 'BALANCE_WITHDRAWAL',
        entity: 'TransaksiPenarikan',
        entity_id: String(createdWd.withdrawal_id),
        details_summary: wdDetailsSummary,
        timestamp: wdDate,
        user_id: 'admin-pos-ba'
      }
    });
  }

  console.log('Seeding Multi-Month Historical Transactions & Withdrawals complete.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
