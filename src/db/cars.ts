import { db } from './index.ts';
import { cars } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { inMemoryStore, loadLocalStore, saveLocalStore, INITIAL_CARS } from './localStore.ts';

export interface CarInput {
  id?: string;
  make: string;
  model: string;
  color?: string;
  year?: number;
  category: string;
  bodyType?: string;
  serviceType?: string;
  rentalType?: string;
  seats?: number;
  luggage?: string;
  horsepower?: string;
  engine?: string;
  engineCapacity?: string;
  length?: string;
  width?: string;
  height?: string;
  rentalPeriod?: string;
  dailyPriceAED?: number;
  dailyPriceUSD?: number;
  weeklyPriceAED?: number;
  weeklyPriceUSD?: number;
  monthlyPriceAED?: number;
  monthlyPriceUSD?: number;
  yearlyPriceAED?: number;
  yearlyPriceUSD?: number;
  dailyPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  image?: string;
  gallery?: string[];
  images?: string[];
  videoUrl?: string;
  video?: string;
  description?: string;
  getQuoteOption?: boolean;
  isMercedesChauffeur?: boolean;
  isActive?: boolean;
}

const CANONICAL_CAR_IDS = new Set(INITIAL_CARS.map(c => c.id));

export async function syncCarDatabase() {
  loadLocalStore();
  
  // 1. Ensure inMemoryStore contains ONLY the 5 canonical cars (unless user added new ones in this dataset)
  const isLocalStoreStale = inMemoryStore.cars.some(c => !CANONICAL_CAR_IDS.has(c.id));
  if (isLocalStoreStale || inMemoryStore.cars.length < 5) {
    console.log('[Car Database Sync] Purging old records from local store...');
    inMemoryStore.cars = [...INITIAL_CARS];
    saveLocalStore();
  }

  // 2. Sync PostgreSQL database if connected
  try {
    const dbCars = await db.select().from(cars);
    if (Array.isArray(dbCars)) {
      const hasOldRecords = dbCars.some(c => !CANONICAL_CAR_IDS.has(c.id));
      if (hasOldRecords || dbCars.length !== 5) {
        console.log('[Car Database Sync] Cleaning PostgreSQL database to retain ONLY the 5 canonical cars...');
        await db.delete(cars);
        for (const carItem of INITIAL_CARS) {
          await db.insert(cars).values({
            id: carItem.id,
            make: carItem.make,
            model: carItem.model,
            color: carItem.color || '',
            year: Number(carItem.year || 2021),
            category: carItem.category,
            bodyType: carItem.bodyType || '',
            serviceType: carItem.serviceType || 'Self Drive',
            seats: Number(carItem.seats || 5),
            luggage: carItem.luggage || '2 Bags',
            horsepower: carItem.horsepower || '',
            engine: carItem.engine || '',
            engineCapacity: carItem.engineCapacity || '',
            length: carItem.length || '',
            width: carItem.width || '',
            height: carItem.height || '',
            rentalPeriod: carItem.rentalPeriod || 'Monthly',
            dailyPriceAED: Number(carItem.dailyPriceAED || 0),
            dailyPriceUSD: Number(carItem.dailyPriceUSD || 0),
            weeklyPriceAED: Number(carItem.weeklyPriceAED || 0),
            weeklyPriceUSD: Number(carItem.weeklyPriceUSD || 0),
            monthlyPriceAED: Number(carItem.monthlyPriceAED || 0),
            monthlyPriceUSD: Number(carItem.monthlyPriceUSD || 0),
            yearlyPriceAED: Number(carItem.yearlyPriceAED || 0),
            yearlyPriceUSD: Number(carItem.yearlyPriceUSD || 0),
            image: carItem.image || '',
            gallery: carItem.gallery || '[]',
            videoUrl: carItem.videoUrl || '',
            description: carItem.description || '',
            getQuoteOption: Boolean(carItem.getQuoteOption),
            isMercedesChauffeur: Boolean(carItem.isMercedesChauffeur),
            isActive: Boolean(carItem.isActive),
            createdAt: new Date(carItem.createdAt),
            updatedAt: new Date(carItem.updatedAt)
          } as any);
        }
        console.log('[Car Database Sync] PostgreSQL database successfully synced with 5 canonical cars.');
      }
    }
  } catch (error) {
    // Database unconfigured or unavailable; safely ignored
  }
}

function parseCarRecord(c: any, index: number = 0) {
  if (!c) return null;
  let galleryArray: string[] = [];
  if (Array.isArray(c.gallery)) {
    galleryArray = c.gallery;
  } else if (typeof c.gallery === 'string') {
    try {
      const parsed = JSON.parse(c.gallery);
      galleryArray = Array.isArray(parsed) ? parsed : [];
    } catch {
      galleryArray = [];
    }
  }
  return {
    ...c,
    id: c.id ? String(c.id) : `car_rec_${index}_${Date.now()}`,
    gallery: galleryArray
  };
}

export async function getActiveCars() {
  await syncCarDatabase();
  try {
    const dbResult = await db.select().from(cars).where(eq(cars.isActive, true)).orderBy(desc(cars.createdAt));
    if (Array.isArray(dbResult) && dbResult.length > 0) {
      return dbResult.map(parseCarRecord);
    }
  } catch (error) {
    // Database connection refused or unconfigured - fallback safely to store
    console.warn('[Database Notice] getActiveCars fallback to local store:', (error as any)?.message);
  }

  loadLocalStore();
  return inMemoryStore.cars.filter(c => c.isActive !== false).map(parseCarRecord);
}

export async function getAllCarsAdmin() {
  await syncCarDatabase();
  try {
    const dbResult = await db.select().from(cars).orderBy(desc(cars.createdAt));
    if (Array.isArray(dbResult) && dbResult.length > 0) {
      return dbResult.map(parseCarRecord);
    }
  } catch (error) {
    console.warn('[Database Notice] getAllCarsAdmin fallback to local store:', (error as any)?.message);
  }

  loadLocalStore();
  return inMemoryStore.cars.map(parseCarRecord);
}

export async function getCarById(id: string) {
  try {
    const result = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    if (Array.isArray(result)) {
      if (result.length > 0) return parseCarRecord(result[0]);
      return null;
    }
  } catch (error) {
    console.warn('[Database Notice] getCarById fallback to local store:', (error as any)?.message);
  }

  loadLocalStore();
  const found = inMemoryStore.cars.find(c => c.id === id);
  return found ? parseCarRecord(found) : null;
}

export async function createCar(data: CarInput) {
  const id = data.id || `car-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const dailyAED = data.dailyPriceAED !== undefined ? Number(data.dailyPriceAED) : 0;
  const dailyUSD = data.dailyPriceUSD !== undefined ? Number(data.dailyPriceUSD) : Math.round(dailyAED / 3.67);
  const weeklyAED = data.weeklyPriceAED !== undefined ? Number(data.weeklyPriceAED) : (dailyAED * 6);
  const weeklyUSD = data.weeklyPriceUSD !== undefined ? Number(data.weeklyPriceUSD) : Math.round(weeklyAED / 3.67);
  const monthlyAED = data.monthlyPriceAED !== undefined ? Number(data.monthlyPriceAED) : (dailyAED * 20);
  const monthlyUSD = data.monthlyPriceUSD !== undefined ? Number(data.monthlyPriceUSD) : Math.round(monthlyAED / 3.67);
  const yearlyAED = data.yearlyPriceAED !== undefined ? Number(data.yearlyPriceAED) : (monthlyAED * 10);
  const yearlyUSD = data.yearlyPriceUSD !== undefined ? Number(data.yearlyPriceUSD) : Math.round(yearlyAED / 3.67);

  const galleryList = Array.isArray(data.gallery) ? data.gallery : (Array.isArray(data.images) ? data.images : []);

  const carRecord = {
    id,
    make: data.make,
    model: data.model,
    color: data.color || '',
    year: data.year || 2021,
    category: data.category,
    bodyType: data.bodyType || '',
    serviceType: data.serviceType || 'Self Drive',
    seats: data.seats || 5,
    luggage: data.luggage || '2 Bags',
    horsepower: data.horsepower || '',
    engine: data.engine || '',
    engineCapacity: data.engineCapacity || '',
    length: data.length || '',
    width: data.width || '',
    height: data.height || '',
    rentalPeriod: data.rentalPeriod || 'Monthly',
    dailyPriceAED: dailyAED,
    dailyPriceUSD: dailyUSD,
    weeklyPriceAED: weeklyAED,
    weeklyPriceUSD: weeklyUSD,
    monthlyPriceAED: monthlyAED,
    monthlyPriceUSD: monthlyUSD,
    yearlyPriceAED: yearlyAED,
    yearlyPriceUSD: yearlyUSD,
    image: data.image || '',
    gallery: JSON.stringify(galleryList),
    videoUrl: data.videoUrl || data.video || '',
    description: data.description || '',
    getQuoteOption: Boolean(data.getQuoteOption),
    isMercedesChauffeur: data.isMercedesChauffeur !== undefined 
      ? Boolean(data.isMercedesChauffeur) 
      : String(data.make || '').toLowerCase().includes('mercedes'),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const result = await db.insert(cars).values(carRecord as any).returning();
    if (result && result[0]) {
      const parsed = parseCarRecord(result[0]);
      loadLocalStore();
      inMemoryStore.cars.unshift(parsed);
      saveLocalStore();
      return parsed;
    }
  } catch (error) {
    console.warn('[Database Notice] createCar fallback to local store:', (error as any)?.message);
  }

  loadLocalStore();
  const parsedLocal = { ...carRecord, gallery: galleryList, createdAt: carRecord.createdAt.toISOString(), updatedAt: carRecord.updatedAt.toISOString() };
  inMemoryStore.cars.unshift(parsedLocal);
  saveLocalStore();
  return parsedLocal;
}

export async function updateCar(id: string, data: Partial<CarInput>) {
  try {
    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (data.make !== undefined) updatePayload.make = data.make;
    if (data.model !== undefined) updatePayload.model = data.model;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.serviceType !== undefined) updatePayload.serviceType = data.serviceType;
    else if (data.rentalType !== undefined) updatePayload.serviceType = data.rentalType;

    if (data.seats !== undefined) updatePayload.seats = Number(data.seats);
    if (data.luggage !== undefined) updatePayload.luggage = data.luggage;

    // Daily Pricing
    const dailyAED = data.dailyPriceAED !== undefined ? Number(data.dailyPriceAED) : (data.dailyPrice !== undefined ? Number(data.dailyPrice) : undefined);
    if (dailyAED !== undefined) {
      updatePayload.dailyPriceAED = dailyAED;
      updatePayload.dailyPriceUSD = data.dailyPriceUSD !== undefined ? Number(data.dailyPriceUSD) : Math.round(dailyAED / 3.67);
    } else if (data.dailyPriceUSD !== undefined) {
      updatePayload.dailyPriceUSD = Number(data.dailyPriceUSD);
    }

    // Weekly Pricing
    const weeklyAED = data.weeklyPriceAED !== undefined ? Number(data.weeklyPriceAED) : (data.weeklyPrice !== undefined ? Number(data.weeklyPrice) : undefined);
    if (weeklyAED !== undefined) {
      updatePayload.weeklyPriceAED = weeklyAED;
      updatePayload.weeklyPriceUSD = data.weeklyPriceUSD !== undefined ? Number(data.weeklyPriceUSD) : Math.round(weeklyAED / 3.67);
    } else if (data.weeklyPriceUSD !== undefined) {
      updatePayload.weeklyPriceUSD = Number(data.weeklyPriceUSD);
    }

    // Monthly Pricing
    const monthlyAED = data.monthlyPriceAED !== undefined ? Number(data.monthlyPriceAED) : (data.monthlyPrice !== undefined ? Number(data.monthlyPrice) : undefined);
    if (monthlyAED !== undefined) {
      updatePayload.monthlyPriceAED = monthlyAED;
      updatePayload.monthlyPriceUSD = data.monthlyPriceUSD !== undefined ? Number(data.monthlyPriceUSD) : Math.round(monthlyAED / 3.67);
    } else if (data.monthlyPriceUSD !== undefined) {
      updatePayload.monthlyPriceUSD = Number(data.monthlyPriceUSD);
    }

    // Yearly Pricing
    const yearlyAED = data.yearlyPriceAED !== undefined ? Number(data.yearlyPriceAED) : (data.yearlyPrice !== undefined ? Number(data.yearlyPrice) : undefined);
    if (yearlyAED !== undefined) {
      updatePayload.yearlyPriceAED = yearlyAED;
      updatePayload.yearlyPriceUSD = data.yearlyPriceUSD !== undefined ? Number(data.yearlyPriceUSD) : Math.round(yearlyAED / 3.67);
    } else if (data.yearlyPriceUSD !== undefined) {
      updatePayload.yearlyPriceUSD = Number(data.yearlyPriceUSD);
    }

    if (data.image !== undefined) updatePayload.image = data.image;
    if (data.gallery !== undefined) {
      updatePayload.gallery = JSON.stringify(Array.isArray(data.gallery) ? data.gallery : []);
    } else if (data.images !== undefined) {
      updatePayload.gallery = JSON.stringify(Array.isArray(data.images) ? data.images : []);
    }
    if (data.videoUrl !== undefined) updatePayload.videoUrl = data.videoUrl;
    else if (data.video !== undefined) updatePayload.videoUrl = data.video;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.getQuoteOption !== undefined) updatePayload.getQuoteOption = Boolean(data.getQuoteOption);
    if (data.isMercedesChauffeur !== undefined) updatePayload.isMercedesChauffeur = Boolean(data.isMercedesChauffeur);
    if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);

    const result = await db.update(cars)
      .set(updatePayload)
      .where(eq(cars.id, id))
      .returning();

    if (result && result[0]) {
      const parsed = parseCarRecord(result[0]);
      loadLocalStore();
      const idx = inMemoryStore.cars.findIndex(c => c.id === id);
      if (idx !== -1) inMemoryStore.cars[idx] = parsed;
      saveLocalStore();
      return parsed;
    }
  } catch (error) {
    console.warn('[Database Notice] updateCar fallback to local store:', (error as any)?.message);
  }

  loadLocalStore();
  const index = inMemoryStore.cars.findIndex(c => c.id === id);
  if (index === -1) return null;

  const current = inMemoryStore.cars[index];
  const dAED = data.dailyPriceAED !== undefined ? Number(data.dailyPriceAED) : (data.dailyPrice !== undefined ? Number(data.dailyPrice) : current.dailyPriceAED);
  const wAED = data.weeklyPriceAED !== undefined ? Number(data.weeklyPriceAED) : (data.weeklyPrice !== undefined ? Number(data.weeklyPrice) : current.weeklyPriceAED);
  const mAED = data.monthlyPriceAED !== undefined ? Number(data.monthlyPriceAED) : (data.monthlyPrice !== undefined ? Number(data.monthlyPrice) : current.monthlyPriceAED);
  const yAED = data.yearlyPriceAED !== undefined ? Number(data.yearlyPriceAED) : (data.yearlyPrice !== undefined ? Number(data.yearlyPrice) : current.yearlyPriceAED);

  const updatedGallery = data.gallery !== undefined ? data.gallery : (data.images !== undefined ? data.images : current.gallery);

  inMemoryStore.cars[index] = {
    ...current,
    ...data,
    gallery: updatedGallery,
    dailyPriceAED: dAED,
    dailyPriceUSD: data.dailyPriceUSD !== undefined ? Number(data.dailyPriceUSD) : Math.round(dAED / 3.67),
    weeklyPriceAED: wAED,
    weeklyPriceUSD: data.weeklyPriceUSD !== undefined ? Number(data.weeklyPriceUSD) : Math.round(wAED / 3.67),
    monthlyPriceAED: mAED,
    monthlyPriceUSD: data.monthlyPriceUSD !== undefined ? Number(data.monthlyPriceUSD) : Math.round(mAED / 3.67),
    yearlyPriceAED: yAED,
    yearlyPriceUSD: data.yearlyPriceUSD !== undefined ? Number(data.yearlyPriceUSD) : Math.round(yAED / 3.67),
    updatedAt: new Date().toISOString()
  };
  saveLocalStore();
  return inMemoryStore.cars[index];
}

export async function deleteCar(id: string) {
  try {
    const result = await db.delete(cars).where(eq(cars.id, id)).returning();
    if (result && result[0]) {
      loadLocalStore();
      inMemoryStore.cars = inMemoryStore.cars.filter(c => c.id !== id);
      saveLocalStore();
      return parseCarRecord(result[0]);
    }
  } catch (error) {
    console.warn('[Database Notice] deleteCar fallback to local store:', (error as any)?.message);
  }

  loadLocalStore();
  const existing = inMemoryStore.cars.find(c => c.id === id);
  if (!existing) return null;
  inMemoryStore.cars = inMemoryStore.cars.filter(c => c.id !== id);
  saveLocalStore();
  return existing;
}

export async function toggleCarStatus(id: string, newStatus?: boolean) {
  loadLocalStore();
  const current = inMemoryStore.cars.find(c => c.id === id);
  const targetStatus = newStatus !== undefined ? newStatus : current ? !current.isActive : true;

  try {
    const result = await db.update(cars)
      .set({ isActive: targetStatus, updatedAt: new Date() } as any)
      .where(eq(cars.id, id))
      .returning();
    if (result && result[0]) {
      const parsed = parseCarRecord(result[0]);
      const idx = inMemoryStore.cars.findIndex(c => c.id === id);
      if (idx !== -1) inMemoryStore.cars[idx] = parsed;
      saveLocalStore();
      return parsed;
    }
  } catch (error) {
    console.warn('[Database Notice] toggleCarStatus fallback to local store:', (error as any)?.message);
  }

  if (!current) return null;
  current.isActive = targetStatus;
  current.updatedAt = new Date().toISOString();
  saveLocalStore();
  return current;
}
