import fs from 'fs';
import path from 'path';

export interface LocalDbSchema {
  cars: any[];
  enquiries: any[];
  bankDetails: {
    primaryAccount: any;
    secondaryAccount?: any;
  };
}

const DB_FILE = path.join(process.cwd(), 'local_database_fallback.json');

export const INITIAL_CARS = [
  {
    id: 'car-kia-forte-white',
    make: 'Kia',
    model: 'KIA FORTE',
    vehicleName: 'KIA FORTE',
    color: 'WHITE',
    colour: 'WHITE',
    year: 2021,
    category: 'Sedan',
    bodyType: 'Sedan',
    serviceType: 'Self Drive',
    seats: 5,
    luggage: '2 Bags',
    horsepower: '147 HP',
    engine: '2.0L 4 Cylinder',
    engineCapacity: '1,999 cc',
    length: '182.7 in',
    width: '70.9 in',
    height: '56.5 in',
    rentalPeriod: 'Monthly',
    dailyPriceAED: 59,
    dailyPriceUSD: 16,
    weeklyPriceAED: 399,
    weeklyPriceUSD: 109,
    monthlyPriceAED: 1499,
    monthlyPriceUSD: 408,
    yearlyPriceAED: 14990,
    yearlyPriceUSD: 4080,
    image: '',
    gallery: '[]',
    images: [],
    videoUrl: '',
    video: '',
    description: 'KIA FORTE 2021 (WHITE) - 2.0L 4 Cylinder, 147 HP, 5 Persons.',
    getQuoteOption: false,
    isMercedesChauffeur: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'car-kia-soul-gray',
    make: 'Kia',
    model: 'KIA SOUL',
    vehicleName: 'KIA SOUL',
    color: 'GRAY',
    colour: 'GRAY',
    year: 2021,
    category: 'SUV',
    bodyType: 'Compact SUV',
    serviceType: 'Self Drive',
    seats: 5,
    luggage: '3 Bags',
    horsepower: '147 HP',
    engine: '2.0L 4 Cylinder',
    engineCapacity: '1,999 cc',
    length: '165.2 in',
    width: '70.9 in',
    height: '63.0 in',
    rentalPeriod: 'Monthly',
    dailyPriceAED: 49,
    dailyPriceUSD: 13,
    weeklyPriceAED: 339,
    weeklyPriceUSD: 92,
    monthlyPriceAED: 1349,
    monthlyPriceUSD: 368,
    yearlyPriceAED: 13490,
    yearlyPriceUSD: 3680,
    image: '',
    gallery: '[]',
    images: [],
    videoUrl: '',
    video: '',
    description: 'KIA SOUL 2021 (GRAY) - 2.0L 4 Cylinder, 147 HP, 5 Persons.',
    getQuoteOption: false,
    isMercedesChauffeur: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'car-mirage-red',
    make: 'Mitsubishi',
    model: 'MIRAGE',
    vehicleName: 'MIRAGE',
    color: 'RED',
    colour: 'RED',
    year: 2021,
    category: 'Sedan',
    bodyType: 'Hatchback',
    serviceType: 'Self Drive',
    seats: 5,
    luggage: '2 Bags',
    horsepower: '78 HP',
    engine: '1.2L 3 Cylinder',
    engineCapacity: '1,193 cc',
    length: '149.4 in',
    width: '65.0 in',
    height: '59.4 in',
    rentalPeriod: 'Monthly',
    dailyPriceAED: 39,
    dailyPriceUSD: 11,
    weeklyPriceAED: 249,
    weeklyPriceUSD: 68,
    monthlyPriceAED: 999,
    monthlyPriceUSD: 272,
    yearlyPriceAED: 9990,
    yearlyPriceUSD: 2720,
    image: '',
    gallery: '[]',
    images: [],
    videoUrl: '',
    video: '',
    description: 'MIRAGE 2021 (RED) - 1.2L 3 Cylinder, 78 HP, 5 Persons.',
    getQuoteOption: false,
    isMercedesChauffeur: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'car-mirage-black',
    make: 'Mitsubishi',
    model: 'MIRAGE',
    vehicleName: 'MIRAGE',
    color: 'BLACK',
    colour: 'BLACK',
    year: 2021,
    category: 'Sedan',
    bodyType: 'Hatchback',
    serviceType: 'Self Drive',
    seats: 5,
    luggage: '2 Bags',
    horsepower: '78 HP',
    engine: '1.2L 3 Cylinder',
    engineCapacity: '1,193 cc',
    length: '149.4 in',
    width: '65.0 in',
    height: '59.4 in',
    rentalPeriod: 'Monthly',
    dailyPriceAED: 39,
    dailyPriceUSD: 11,
    weeklyPriceAED: 249,
    weeklyPriceUSD: 68,
    monthlyPriceAED: 999,
    monthlyPriceUSD: 272,
    yearlyPriceAED: 9990,
    yearlyPriceUSD: 2720,
    image: '',
    gallery: '[]',
    images: [],
    videoUrl: '',
    video: '',
    description: 'MIRAGE 2021 (BLACK) - 1.2L 3 Cylinder, 78 HP, 5 Persons.',
    getQuoteOption: false,
    isMercedesChauffeur: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'car-mirage-burgundy',
    make: 'Mitsubishi',
    model: 'MIRAGE',
    vehicleName: 'MIRAGE',
    color: 'BURGUNDY',
    colour: 'BURGUNDY',
    year: 2021,
    category: 'Sedan',
    bodyType: 'Hatchback',
    serviceType: 'Self Drive',
    seats: 5,
    luggage: '2 Bags',
    horsepower: '78 HP',
    engine: '1.2L 3 Cylinder',
    engineCapacity: '1,193 cc',
    length: '149.4 in',
    width: '65.0 in',
    height: '59.4 in',
    rentalPeriod: 'Monthly',
    dailyPriceAED: 39,
    dailyPriceUSD: 11,
    weeklyPriceAED: 249,
    weeklyPriceUSD: 68,
    monthlyPriceAED: 999,
    monthlyPriceUSD: 272,
    yearlyPriceAED: 9990,
    yearlyPriceUSD: 2720,
    image: '',
    gallery: '[]',
    images: [],
    videoUrl: '',
    video: '',
    description: 'MIRAGE 2021 (BURGUNDY) - 1.2L 3 Cylinder, 78 HP, 5 Persons.',
    getQuoteOption: false,
    isMercedesChauffeur: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_BANK_DETAILS = {
  primaryAccount: {
    id: 'primary',
    companyAccountName: 'ZONE TOURISM LLC',
    bankName: 'Emirates NBD',
    accountNumber: '1014347702901',
    iban: 'AE79 0260 0010 1434 7702 901',
    swiftCode: '',
    currency: 'AED',
    branchName: 'Dubai Branch',
    country: 'United Arab Emirates',
    instructions: 'For UAE Visit Visa services and general tourism packages.'
  },
  secondaryAccount: {
    id: 'secondary',
    companyAccountName: 'HOTWHEELS CAR RENTALS',
    bankName: 'Habib Bank AG Zurich',
    accountNumber: '02-02-08-020311-105-0573857',
    iban: 'AE03 0290 8902 1050 0573 857',
    swiftCode: 'HBZUAEADXXX',
    currency: 'AED',
    branchName: 'Sharjah Branch',
    country: 'United Arab Emirates',
    instructions: 'For Car Rental, VIP Chauffeur services, and corporate fleet bookings.'
  }
};

let inMemoryStore: LocalDbSchema = {
  cars: [...INITIAL_CARS],
  enquiries: [],
  bankDetails: { ...INITIAL_BANK_DETAILS }
};

export function loadLocalStore(): LocalDbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      const rawCars = Array.isArray(parsed.cars) && parsed.cars.length > 0 ? parsed.cars : [...INITIAL_CARS];
      const sanitizedCars = rawCars.map((c: any, idx: number) => ({
        ...c,
        id: c.id ? String(c.id) : `car_local_${idx + 1}_${Date.now()}`
      }));

      inMemoryStore = {
        cars: sanitizedCars,
        enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
        bankDetails: parsed.bankDetails || { ...INITIAL_BANK_DETAILS }
      };
    } else {
      saveLocalStore();
    }
  } catch (err) {
    console.error('Error reading local fallback database:', err);
  }
  return inMemoryStore;
}

export function saveLocalStore(data?: LocalDbSchema) {
  try {
    if (data) inMemoryStore = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local fallback database:', err);
  }
}

// Initial load
loadLocalStore();

export { inMemoryStore };
