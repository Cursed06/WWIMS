import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
    { category_id: 'CAT-KA', category_name: 'Botol Kaca' },
    { category_id: 'CAT-LA', category_name: 'Lainnya' },
    { category_id: 'CAT-JE', category_name: 'Jelantah' }
  ];

  for (const cat of categories) {
    await prisma.wasteCategory.upsert({
      where: { category_id: cat.category_id },
      update: {},
      create: cat
    });
  }
  console.log('Seed Waste Categories complete.');

  // 5. Seed Waste Types
  const wasteTypes = [
    // PLASTIK
    { waste_type_id: 'PL-01', category_id: 'CAT-PL', waste_name: 'Pet Campur', unit: 'kg' },
    { waste_type_id: 'PL-02', category_id: 'CAT-PL', waste_name: 'Pet Kotor', unit: 'kg' },
    { waste_type_id: 'PL-03', category_id: 'CAT-PL', waste_name: 'Pet Bersih', unit: 'kg' },
    { waste_type_id: 'PL-04', category_id: 'CAT-PL', waste_name: 'Pet Warna Bersih', unit: 'kg' },
    { waste_type_id: 'PL-05', category_id: 'CAT-PL', waste_name: 'Gelas Kotor', unit: 'kg' },
    { waste_type_id: 'PL-06', category_id: 'CAT-PL', waste_name: 'Gelas Bersih', unit: 'kg' },
    { waste_type_id: 'PL-07', category_id: 'CAT-PL', waste_name: 'Ale Ale/Mounty/Teh Gelas', unit: 'kg' },
    { waste_type_id: 'PL-08', category_id: 'CAT-PL', waste_name: 'Olie/Putihan', unit: 'kg' },
    { waste_type_id: 'PL-09', category_id: 'CAT-PL', waste_name: 'Jerigen 5L (per pcs)', unit: 'biji' },
    { waste_type_id: 'PL-10', category_id: 'CAT-PL', waste_name: 'Jerigen 18L (per pcs)', unit: 'biji' },
    { waste_type_id: 'PL-11', category_id: 'CAT-PL', waste_name: 'Tutup Pet/Tutup Galon', unit: 'kg' },
    { waste_type_id: 'PL-12', category_id: 'CAT-PL', waste_name: 'Emberan', unit: 'kg' },
    { waste_type_id: 'PL-13', category_id: 'CAT-PL', waste_name: 'Keras/Paralon/Yakult', unit: 'kg' },
    { waste_type_id: 'PL-14', category_id: 'CAT-PL', waste_name: 'Kresek', unit: 'kg' },
    { waste_type_id: 'PL-15', category_id: 'CAT-PL', waste_name: 'PE', unit: 'kg' },
    { waste_type_id: 'PL-16', category_id: 'CAT-PL', waste_name: 'MLP', unit: 'kg' },

    // KERTAS
    { waste_type_id: 'KE-01', category_id: 'CAT-KE', waste_name: 'Kardus', unit: 'kg' },
    { waste_type_id: 'KE-02', category_id: 'CAT-KE', waste_name: 'VHS/Cetak', unit: 'kg' },
    { waste_type_id: 'KE-03', category_id: 'CAT-KE', waste_name: 'Buku Tulis/Pelajaran/LKS', unit: 'kg' },
    { waste_type_id: 'KE-04', category_id: 'CAT-KE', waste_name: 'Kertas CD/Buram/Tabloid', unit: 'kg' },
    { waste_type_id: 'KE-05', category_id: 'CAT-KE', waste_name: 'Majalah', unit: 'kg' },
    { waste_type_id: 'KE-06', category_id: 'CAT-KE', waste_name: 'Duplek', unit: 'kg' },
    { waste_type_id: 'KE-07', category_id: 'CAT-KE', waste_name: 'Arsip', unit: 'kg' },
    { waste_type_id: 'KE-08', category_id: 'CAT-KE', waste_name: 'Tetra Pack', unit: 'kg' },
    { waste_type_id: 'KE-09', category_id: 'CAT-KE', waste_name: 'Koran', unit: 'kg' },

    // LOGAM
    { waste_type_id: 'LO-01', category_id: 'CAT-LO', waste_name: 'Alumunium Tebal/Panci', unit: 'kg' },
    { waste_type_id: 'LO-02', category_id: 'CAT-LO', waste_name: 'Alumunium Tipis/Kaleng', unit: 'kg' },
    { waste_type_id: 'LO-03', category_id: 'CAT-LO', waste_name: 'Besi Tebal', unit: 'kg' },
    { waste_type_id: 'LO-04', category_id: 'CAT-LO', waste_name: 'Besi Tipis', unit: 'kg' },
    { waste_type_id: 'LO-05', category_id: 'CAT-LO', waste_name: 'Tembaga', unit: 'kg' },
    { waste_type_id: 'LO-06', category_id: 'CAT-LO', waste_name: 'Seng', unit: 'kg' },
    { waste_type_id: 'LO-07', category_id: 'CAT-LO', waste_name: 'Oplong', unit: 'kg' },

    // BOTOL KACA
    { waste_type_id: 'KA-01', category_id: 'CAT-KA', waste_name: 'Bir Besar', unit: 'kg' },
    { waste_type_id: 'KA-02', category_id: 'CAT-KA', waste_name: 'Bir Kecil', unit: 'kg' },
    { waste_type_id: 'KA-03', category_id: 'CAT-KA', waste_name: 'Singaraja Besar', unit: 'kg' },
    { waste_type_id: 'KA-04', category_id: 'CAT-KA', waste_name: 'Draf Besar', unit: 'kg' },
    { waste_type_id: 'KA-05', category_id: 'CAT-KA', waste_name: 'Bening Putih', unit: 'kg' },
    { waste_type_id: 'KA-06', category_id: 'CAT-KA', waste_name: 'Warna Besar/Kecil Campur', unit: 'kg' },

    // LAINNYA
    { waste_type_id: 'LA-01', category_id: 'CAT-LA', waste_name: 'Accu', unit: 'kg' },
    { waste_type_id: 'LA-02', category_id: 'CAT-LA', waste_name: 'Spon/Sepatu Sandal Bekas', unit: 'kg' },
    { waste_type_id: 'LA-03', category_id: 'CAT-LA', waste_name: 'Elektronik Bekas/TV', unit: 'kg' },
    { waste_type_id: 'LA-04', category_id: 'CAT-LA', waste_name: 'Dinamo', unit: 'kg' },
    { waste_type_id: 'LA-05', category_id: 'CAT-LA', waste_name: 'Krat Telur', unit: 'kg' },
    { waste_type_id: 'LA-06', category_id: 'CAT-LA', waste_name: 'Sterofoam', unit: 'kg' },

    // JELANTAH
    { waste_type_id: 'JE-01', category_id: 'CAT-JE', waste_name: 'Minyak Goreng Bekas', unit: 'liter' }
  ];

  for (const wt of wasteTypes) {
    await prisma.wasteType.upsert({
      where: { waste_type_id: wt.waste_type_id },
      update: {},
      create: wt
    });
  }
  console.log('Seed Waste Types complete.');

  // 6. Seed Vendor Prices
  // Map base prices from spreadsheet for Bali Bersih (V-BB)
  // Bali Waste Cycle (V-BWC) gets a 10% premium on buy/sell to demo dynamic pricing
  // Metro Oil (V-MO) handles Jelantah (JE-01) only
  const basePrices = {
    'PL-01': { buy: 600, sell: 800 },
    'PL-02': { buy: 1000, sell: 1200 },
    'PL-03': { buy: 2000, sell: 2500 },
    'PL-04': { buy: 1000, sell: 1200 },
    'PL-05': { buy: 1000, sell: 1300 },
    'PL-06': { buy: 2000, sell: 2500 },
    'PL-07': { buy: 800, sell: 1000 },
    'PL-08': { buy: 1600, sell: 1800 },
    'PL-09': { buy: 500, sell: 800 },
    'PL-10': { buy: 4500, sell: 5000 },
    'PL-11': { buy: 2000, sell: 2500 },
    'PL-12': { buy: 500, sell: 700 },
    'PL-13': { buy: 400, sell: 500 },
    'PL-14': { buy: 200, sell: 300 },
    'PL-15': { buy: 500, sell: 600 },
    'PL-16': { buy: 25, sell: 50 },

    'KE-01': { buy: 1300, sell: 1500 },
    'KE-02': { buy: 1600, sell: 1900 },
    'KE-03': { buy: 800, sell: 1000 },
    'KE-04': { buy: 800, sell: 1000 },
    'KE-05': { buy: 500, sell: 700 },
    'KE-06': { buy: 400, sell: 600 },
    'KE-07': { buy: 400, sell: 600 },
    'KE-08': { buy: 100, sell: 100 },
    'KE-09': { buy: 5000, sell: 5500 },

    'LO-01': { buy: 10000, sell: 11000 },
    'LO-02': { buy: 9000, sell: 10000 },
    'LO-03': { buy: 3000, sell: 3200 },
    'LO-04': { buy: 1800, sell: 2000 },
    'LO-05': { buy: 75000, sell: 80000 },
    'LO-06': { buy: 800, sell: 1000 },
    'LO-07': { buy: 1500, sell: 1800 },

    'KA-01': { buy: 700, sell: 800 },
    'KA-02': { buy: 300, sell: 400 },
    'KA-03': { buy: 300, sell: 400 },
    'KA-04': { buy: 500, sell: 600 },
    'KA-05': { buy: 50, sell: 75 },
    'KA-06': { buy: 25, sell: 50 },

    'LA-01': { buy: 6000, sell: 6500 },
    'LA-02': { buy: 100, sell: 200 },
    'LA-03': { buy: 500, sell: 800 },
    'LA-04': { buy: 3500, sell: 4000 },
    'LA-05': { buy: 100, sell: 200 },
    'LA-06': { buy: 100, sell: 200 }
  };

  // Seed prices for Bali Bersih (V-BB)
  for (const [wtId, prices] of Object.entries(basePrices)) {
    await prisma.vendorPrice.upsert({
      where: { vendor_id_waste_type_id: { vendor_id: 'V-BB', waste_type_id: wtId } },
      update: {},
      create: {
        vendor_id: 'V-BB',
        waste_type_id: wtId,
        buy_price: prices.buy,
        sell_price: prices.sell
      }
    });
  }

  // Seed prices for Bali Waste Cycle (V-BWC) - slightly higher
  for (const [wtId, prices] of Object.entries(basePrices)) {
    await prisma.vendorPrice.upsert({
      where: { vendor_id_waste_type_id: { vendor_id: 'V-BWC', waste_type_id: wtId } },
      update: {},
      create: {
        vendor_id: 'V-BWC',
        waste_type_id: wtId,
        buy_price: Math.round(prices.buy * 1.05), // 5% higher buy price
        sell_price: Math.round(prices.sell * 1.05)
      }
    });
  }

  // Seed Jelantah price for Metro Oil (V-MO) - measured in Liters
  await prisma.vendorPrice.upsert({
    where: { vendor_id_waste_type_id: { vendor_id: 'V-MO', waste_type_id: 'JE-01' } },
    update: {},
    create: {
      vendor_id: 'V-MO',
      waste_type_id: 'JE-01',
      buy_price: 4000.00, // Rp 4,000 per liter buy price
      sell_price: 4500.00 // Rp 4,500 per liter sell price
    }
  });

  console.log('Seed Vendor Prices complete.');

  // 7. Seed Test Simulation Users (for bypass testing in v1.0.0)
  const users = [
    {
      user_id: 'admin-pusat',
      username: 'pusat',
      password_hash: '$2b$10$tMhO6N2CgC4LzJdJ8tU2Kexg/5JzPqG62xKx.8p2W02y7.81vO18e', // 'admin123'
      role: 'ADMIN_PUSAT',
      pos_id: null
    },
    {
      user_id: 'admin-pos-ba',
      username: 'pos_ba',
      password_hash: '$2b$10$tMhO6N2CgC4LzJdJ8tU2Kexg/5JzPqG62xKx.8p2W02y7.81vO18e',
      role: 'ADMIN_POS',
      pos_id: 'BA'
    },
    {
      user_id: 'admin-pos-dl',
      username: 'pos_dl',
      password_hash: '$2b$10$tMhO6N2CgC4LzJdJ8tU2Kexg/5JzPqG62xKx.8p2W02y7.81vO18e',
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
  console.log('Seed Simulation Users complete.');

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
