import { InventoryVehicle, CorporateRate, FleetVehicle } from '../types';

export const CORPORATE_RATES_METADATA = {
  title: "HOTWHEEL CAR RENTAL LLC CORPORATE VEHICLE RATE LIST",
  validity: "01 Oct 2026 – 31 Dec 2026",
  mileageLongTerm: "2500 kms or 2500 kms/Month"
};

// =========================================================================
// CHAUFFEUR SERVICE OPTIONS
// =========================================================================
export const CHAUFFEUR_SERVICE_OPTIONS = [
  {
    id: 'airport-transfer',
    title: 'Airport Transfer',
    subtitle: 'DXB, DWC & UAE Airports',
    description: 'Airport arrival and departure transfers across Dubai (DXB/DWC) and UAE airports.',
    idealFor: 'Airport arrivals, departures & hotel transfers'
  },
  {
    id: 'hourly-hire',
    title: 'Hourly Hire',
    subtitle: 'Flexible As-Directed Service',
    description: 'Dedicated vehicle with driver for multiple stops, business roadshows, shopping, and city transport.',
    idealFor: 'Executive meetings, multi-stop schedules & shopping trips'
  },
  {
    id: 'full-day-chauffeur',
    title: 'Full-Day Chauffeur',
    subtitle: 'Full Day Dedicated Service',
    description: 'All-day private vehicle with driver for scheduled itineraries and daily travel.',
    idealFor: 'Corporate delegations, tourist day trips & full-day events'
  },
  {
    id: 'corporate-transfer',
    title: 'Corporate Transfer',
    subtitle: 'DIFC, DWTC & Business Hubs',
    description: 'Executive transportation with driver for corporate clients, business executives, delegations, and conferences.',
    idealFor: 'Corporate meetings, conferences & business travel'
  }
] as const;

// =========================================================================
// CANONICAL FLEET CATALOG (5 VEHICLES ONLY)
// =========================================================================
export const FLEET_CATALOG: FleetVehicle[] = [
  {
    id: 'car-kia-forte-white',
    makeModel: 'KIA FORTE',
    brand: 'Kia',
    category: 'Sedan',
    serviceType: 'SELF DRIVE',
    serviceAssignment: 'Self Drive',
    seats: 5,
    luggageCapacity: '2 Bags',
    image: '',
    gallery: [],
    videoUrl: '',
    transmission: 'Automatic',
    dailyRateAED: 59,
    weeklyRateAED: 399,
    monthlyRateAED: 1499,
    description: 'KIA FORTE 2021 (WHITE) - 2.0L 4 Cylinder, 147 HP, 1,999 cc, 5 Persons. Length: 182.7 in, Width: 70.9 in, Height: 56.5 in. Sedan.'
  },
  {
    id: 'car-kia-soul-gray',
    makeModel: 'KIA SOUL',
    brand: 'Kia',
    category: 'SUV',
    serviceType: 'SELF DRIVE',
    serviceAssignment: 'Self Drive',
    seats: 5,
    luggageCapacity: '3 Bags',
    image: '',
    gallery: [],
    videoUrl: '',
    transmission: 'Automatic',
    dailyRateAED: 49,
    weeklyRateAED: 339,
    monthlyRateAED: 1349,
    description: 'KIA SOUL 2021 (GRAY) - 2.0L 4 Cylinder, 147 HP, 1,999 cc, 5 Persons. Length: 165.2 in, Width: 70.9 in, Height: 63.0 in. Compact SUV.'
  },
  {
    id: 'car-mirage-red',
    makeModel: 'MIRAGE',
    brand: 'Other',
    category: 'Sedan',
    serviceType: 'SELF DRIVE',
    serviceAssignment: 'Self Drive',
    seats: 5,
    luggageCapacity: '2 Bags',
    image: '',
    gallery: [],
    videoUrl: '',
    transmission: 'Automatic',
    dailyRateAED: 39,
    weeklyRateAED: 249,
    monthlyRateAED: 999,
    description: 'MIRAGE 2021 (RED) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.'
  },
  {
    id: 'car-mirage-black',
    makeModel: 'MIRAGE',
    brand: 'Other',
    category: 'Sedan',
    serviceType: 'SELF DRIVE',
    serviceAssignment: 'Self Drive',
    seats: 5,
    luggageCapacity: '2 Bags',
    image: '',
    gallery: [],
    videoUrl: '',
    transmission: 'Automatic',
    dailyRateAED: 39,
    weeklyRateAED: 249,
    monthlyRateAED: 999,
    description: 'MIRAGE 2021 (BLACK) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.'
  },
  {
    id: 'car-mirage-burgundy',
    makeModel: 'MIRAGE',
    brand: 'Other',
    category: 'Sedan',
    serviceType: 'SELF DRIVE',
    serviceAssignment: 'Self Drive',
    seats: 5,
    luggageCapacity: '2 Bags',
    image: '',
    gallery: [],
    videoUrl: '',
    transmission: 'Automatic',
    dailyRateAED: 39,
    weeklyRateAED: 249,
    monthlyRateAED: 999,
    description: 'MIRAGE 2021 (BURGUNDY) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.'
  }
];

export const MERCEDES_FLEET: FleetVehicle[] = [];

export const CORPORATE_RATES: Record<string, CorporateRate> = {
  "KIA FORTE": {
    rateCategory: "KIA FORTE",
    daily: 59,
    weekly: 399,
    oneMonth: 1499,
    threeMonth: 1450,
    sixMonth: 1400,
    nineMonth: 1350,
    twelveMonth: 1300
  },
  "KIA SOUL": {
    rateCategory: "KIA SOUL",
    daily: 49,
    weekly: 339,
    oneMonth: 1349,
    threeMonth: 1300,
    sixMonth: 1250,
    nineMonth: 1200,
    twelveMonth: 1150
  },
  "MIRAGE": {
    rateCategory: "MIRAGE",
    daily: 39,
    weekly: 249,
    oneMonth: 999,
    threeMonth: 950,
    sixMonth: 925,
    nineMonth: 900,
    twelveMonth: 875
  }
};

export const INVENTORY_VEHICLES: InventoryVehicle[] = FLEET_CATALOG.map((car, idx) => ({
  id: car.id,
  serialNumber: idx + 1,
  vehicleName: car.makeModel,
  colour: car.id.includes('white') ? 'WHITE' : car.id.includes('gray') ? 'GRAY' : car.id.includes('red') ? 'RED' : car.id.includes('black') ? 'BLACK' : 'BURGUNDY',
  model: '2021',
  category: car.category === 'SUV' ? 'SUVs' : 'Economy Cars',
  image: '',
  rateCategory: car.makeModel,
  seats: car.seats,
  transmission: 'Automatic',
  features: ['Air Conditioning', 'Automatic Transmission'],
  description: car.description
}));
