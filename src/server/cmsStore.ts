/**
 * INITIAL CMS MOCK STORE (PHASE 1)
 * Provides pre-seeded state for Visa Services, Cars, Mercedes Chauffeur, Enquiries, and Company Info.
 * Stored and managed server-side with proper authentication.
 */

export interface ServerVisaService {
  id: string;
  destination: string;
  visaType: string;
  duration: string;
  entryType: 'Single Entry' | 'Multiple Entry';
  priceAED: number;
  priceUSD: number;
  description: string;
  documents: string[];
  processingInfo: string;
  isActive: boolean;
  popular?: boolean;
}

export interface ServerCar {
  id: string;
  make: string;
  model: string;
  category: string;
  seats: number;
  luggage: string;
  image: string;
  rentalType: 'Self Drive' | 'Chauffeur Driven' | 'Both';
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  getQuoteOption: boolean;
  isAvailable: boolean;
  isMercedesChauffeur: boolean;
  description: string;
}

export interface ServerEnquiry {
  id: string;
  referenceId: string;
  type: 'visa' | 'car-rental';
  createdAt: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Completed';
  internalNotes: string;
  data: Record<string, any>;
}

export interface ServerCompanyInfo {
  travelCompanyName: string;
  carRentalCompanyName: string;
  unifiedName: string;
  phones: string[];
  whatsappNumbers: string[];
  email: string;
  accountsEmail: string;
  officeAddress: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  };
  bankDetails: {
    primaryAccount: {
      companyAccountName: string;
      bankName: string;
      accountNumber: string;
      iban: string;
      swiftCode: string;
      currency: string;
      branchName: string;
      country: string;
      instructions: string;
    };
    secondaryAccount?: {
      companyAccountName: string;
      bankName: string;
      accountNumber: string;
      iban: string;
      swiftCode: string;
      currency: string;
      branchName: string;
      country: string;
      instructions: string;
    };
  };
}

export const INITIAL_VISA_SERVICES: ServerVisaService[] = [
  {
    id: 'visa-1',
    destination: 'United Arab Emirates (UAE)',
    visaType: 'UAE Visit Visa',
    duration: '30 & 60 Days',
    entryType: 'Single Entry',
    priceAED: 350,
    priceUSD: 100,
    description: 'Official visit visa assistance for tourists and visitors to Dubai and all UAE emirates.',
    documents: [
      'Clear Color Passport Copy',
      'Passport minimum 6 months validity',
      'Passport Cover Page',
      'Recent Passport-Size Photograph — White Background',
      'Confirmed Return/Onward Air Ticket — if required'
    ],
    processingInfo: 'Processing time may vary depending on visa type, nationality and UAE Immigration approval.',
    isActive: true,
    popular: true
  },
  {
    id: 'visa-2',
    destination: 'Schengen Area (Europe)',
    visaType: 'Schengen Visa Assistance',
    duration: 'Short Stay',
    entryType: 'Single Entry',
    priceAED: 650,
    priceUSD: 180,
    description: 'Application assistance and document review for travel across 29 Schengen member countries.',
    documents: [
      'Passport valid for at least 6 months with 2 blank pages',
      'Recent passport-size photographs (white background)',
      'Confirmed flight reservation and proof of accommodation',
      'Bank statements (last 3 to 6 months)',
      'Employment verification letter / NOC'
    ],
    processingInfo: 'Approx. 10 to 15 Working Days (subject to consulate).',
    isActive: true,
    popular: false
  },
  {
    id: 'visa-3',
    destination: 'United Kingdom (UK)',
    visaType: 'UK Visa Assistance',
    duration: 'Standard Visitor',
    entryType: 'Multiple Entry',
    priceAED: 700,
    priceUSD: 190,
    description: 'UK Standard Visitor Visa application preparation, document check, and appointment assistance.',
    documents: [
      'Valid passport with minimum 6 months validity',
      'Digital passport-size photograph',
      'Personal bank statements showing available funds',
      'Employment verification and leave approval letter',
      'Travel itinerary and accommodation booking'
    ],
    processingInfo: 'Approx. 3 to 6 Weeks (UKVI dependent).',
    isActive: true,
    popular: false
  },
  {
    id: 'visa-4',
    destination: 'United States of America (USA)',
    visaType: 'USA Visa Assistance',
    duration: 'B1/B2 Visitor',
    entryType: 'Multiple Entry',
    priceAED: 750,
    priceUSD: 205,
    description: 'DS-160 review, embassy appointment guidance, and documentation pre-checks for USA visitor visas.',
    documents: [
      'Valid passport with minimum 6 months validity',
      'Completed DS-160 application confirmation barcode',
      'Recent 2x2 inch (51x51 mm) photograph (white background)',
      'Proof of financial solvency and ties to residence country',
      'Appointment confirmation sheet'
    ],
    processingInfo: 'Subject to US Embassy appointment availability.',
    isActive: true,
    popular: false
  },
  {
    id: 'visa-5',
    destination: 'China',
    visaType: 'China Business / Tourist Visa',
    duration: 'Business / Tourist',
    entryType: 'Single Entry',
    priceAED: 600,
    priceUSD: 165,
    description: 'Consular document preparation and submission assistance for China tourist (L) and business (M) visas.',
    documents: [
      'Original passport valid for at least 6 months with blank pages',
      'Recent passport photograph (white background)',
      'Official invitation letter (Business) or hotel bookings (Tourist)',
      'Round-trip airline booking confirmation',
      'UAE residence visa & Emirates ID copy (if applying from UAE)'
    ],
    processingInfo: 'Approx. 4 to 7 Working Days (consulate dependent).',
    isActive: true,
    popular: false
  }
];

export const INITIAL_CARS: ServerCar[] = [
  {
    id: 'car-kia-forte-white',
    make: 'Kia',
    model: 'KIA FORTE',
    category: 'Sedan',
    seats: 5,
    luggage: '2 Bags',
    image: '',
    rentalType: 'Self Drive',
    dailyPrice: 59,
    weeklyPrice: 399,
    monthlyPrice: 1499,
    getQuoteOption: false,
    isAvailable: true,
    isMercedesChauffeur: false,
    description: 'KIA FORTE 2021 (WHITE) - 2.0L 4 Cylinder, 147 HP, 1,999 cc, 5 Persons. Length: 182.7 in, Width: 70.9 in, Height: 56.5 in. Sedan.'
  },
  {
    id: 'car-kia-soul-gray',
    make: 'Kia',
    model: 'KIA SOUL',
    category: 'SUV',
    seats: 5,
    luggage: '3 Bags',
    image: '',
    rentalType: 'Self Drive',
    dailyPrice: 49,
    weeklyPrice: 339,
    monthlyPrice: 1349,
    getQuoteOption: false,
    isAvailable: true,
    isMercedesChauffeur: false,
    description: 'KIA SOUL 2021 (GRAY) - 2.0L 4 Cylinder, 147 HP, 1,999 cc, 5 Persons. Length: 165.2 in, Width: 70.9 in, Height: 63.0 in. Compact SUV.'
  },
  {
    id: 'car-mirage-red',
    make: 'Mitsubishi',
    model: 'MIRAGE',
    category: 'Sedan',
    seats: 5,
    luggage: '2 Bags',
    image: '',
    rentalType: 'Self Drive',
    dailyPrice: 39,
    weeklyPrice: 249,
    monthlyPrice: 999,
    getQuoteOption: false,
    isAvailable: true,
    isMercedesChauffeur: false,
    description: 'MIRAGE 2021 (RED) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.'
  },
  {
    id: 'car-mirage-black',
    make: 'Mitsubishi',
    model: 'MIRAGE',
    category: 'Sedan',
    seats: 5,
    luggage: '2 Bags',
    image: '',
    rentalType: 'Self Drive',
    dailyPrice: 39,
    weeklyPrice: 249,
    monthlyPrice: 999,
    getQuoteOption: false,
    isAvailable: true,
    isMercedesChauffeur: false,
    description: 'MIRAGE 2021 (BLACK) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.'
  },
  {
    id: 'car-mirage-burgundy',
    make: 'Mitsubishi',
    model: 'MIRAGE',
    category: 'Sedan',
    seats: 5,
    luggage: '2 Bags',
    image: '',
    rentalType: 'Self Drive',
    dailyPrice: 39,
    weeklyPrice: 249,
    monthlyPrice: 999,
    getQuoteOption: false,
    isAvailable: true,
    isMercedesChauffeur: false,
    description: 'MIRAGE 2021 (BURGUNDY) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.'
  }
];

export const INITIAL_ENQUIRIES: ServerEnquiry[] = [
  {
    id: 'enq-1',
    referenceId: 'HWZ-VE-83912',
    type: 'visa',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'New',
    internalNotes: 'Applicant contacted through site; requesting 60-day visa for family of 3.',
    data: {
      name: 'Alexander Petrov',
      nationality: 'Russia',
      isUaeResident: 'No',
      destination: 'Dubai',
      travelDate: '2026-10-15',
      whatsappNumber: '+79160000001'
    }
  },
  {
    id: 'enq-2',
    referenceId: 'HWZ-CRE-49201',
    type: 'car-rental',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'Contacted',
    internalNotes: 'Client wants Mercedes V-Class with driver for 3 days starting at DXB Terminal 3. Quoted AED 3,600.',
    data: {
      pickupLocation: 'Dubai International Airport (DXB) - Terminal 3',
      dropOffLocation: 'Dubai International Airport (DXB) - Terminal 3',
      pickupDate: '2026-09-25',
      pickupTime: '10:00 AM',
      returnDate: '2026-09-28',
      returnTime: '10:00 AM',
      serviceType: 'Chauffeur Driven',
      vehicleType: 'Mercedes-Benz Executive (V-Class, Vito, S-Class)',
      whatsappNumber: '+971550000002'
    }
  },
  {
    id: 'enq-3',
    referenceId: 'HWZ-VE-29402',
    type: 'visa',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'In Progress',
    internalNotes: 'Passport scans received and reviewed. Submitting to ICP immigration system.',
    data: {
      name: 'Maria Santos',
      nationality: 'Philippines',
      isUaeResident: 'No',
      destination: 'Dubai',
      travelDate: '2026-10-01',
      whatsappNumber: '+639170000003'
    }
  },
  {
    id: 'enq-4',
    referenceId: 'HWZ-CRE-91823',
    type: 'car-rental',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'Completed',
    internalNotes: 'Self drive contract executed; Toyota Fortuner delivered to Downtown Dubai hotel.',
    data: {
      pickupLocation: 'Downtown Dubai / Burj Khalifa',
      dropOffLocation: 'Dubai Marina / JBR',
      pickupDate: '2026-09-18',
      pickupTime: '09:00 AM',
      returnDate: '2026-09-22',
      returnTime: '06:00 PM',
      serviceType: 'Self Drive',
      vehicleType: 'Midsize SUV (e.g. Toyota RAV4, Hyundai Tucson, Kia Sportage)',
      whatsappNumber: '+447911123456'
    }
  }
];

export const INITIAL_COMPANY_INFO: ServerCompanyInfo = {
  travelCompanyName: 'ZONE TOURISM LLC',
  carRentalCompanyName: 'HOTWHEELS CAR RENTAL LLC',
  unifiedName: 'ZONE TOURISM LLC & HOTWHEELS CAR RENTAL LLC',
  phones: [],
  whatsappNumbers: [],
  email: '',
  accountsEmail: '',
  officeAddress: 'Dubai, United Arab Emirates',
  socialLinks: {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  },
  bankDetails: {
    primaryAccount: {
      companyAccountName: 'ZONE TOURISM LLC',
      bankName: '',
      accountNumber: '',
      iban: '',
      swiftCode: '',
      currency: 'AED',
      branchName: '',
      country: 'United Arab Emirates',
      instructions: 'For UAE Visit Visa services and general tourism packages.'
    },
    secondaryAccount: {
      companyAccountName: 'HOTWHEELS CAR RENTAL LLC',
      bankName: '',
      accountNumber: '',
      iban: '',
      swiftCode: '',
      currency: 'AED',
      branchName: '',
      country: 'United Arab Emirates',
      instructions: 'For Car Rental, VIP Chauffeur services, and corporate fleet bookings.'
    }
  }
};
