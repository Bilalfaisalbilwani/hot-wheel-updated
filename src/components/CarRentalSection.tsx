import React, { useState, useEffect } from 'react';
import { FLEET_CATALOG, COMPANY_CONFIG } from '../data/travelData';
import { FleetVehicle, RentalServiceType, VehicleCategory } from '../types';
import { 
  Car, ShieldCheck, Users, Briefcase, Search, 
  Send, Filter, Info, ArrowRight, Play, Film, Sparkles,
  Eye, Image as ImageIcon, Video, Maximize 
} from 'lucide-react';
import { WhatsAppOfficialIcon } from './WhatsAppFloat';
import { useCurrency, PriceDisplay } from '../context/CurrencyContext';
import { DirhamSymbol } from './DirhamSymbol';
import { CarVideoModal } from './CarVideoModal';

interface CarRentalSectionProps {
  onOpenEnquiry?: (type: 'visa' | 'car-rental', item?: string) => void;
  showAll?: boolean;
  initialServiceType?: RentalServiceType;
  onNavigateToMercedes?: () => void;
}

export type RentalPeriod = 'daily' | 'weekly' | 'monthly';

// 4 Basic Requested Categories (+ All option)
const CATEGORIES: ('All' | VehicleCategory)[] = [
  'All',
  'Sedan',
  'SUV',
  'Luxury',
  '7-Seater / MPV'
];

export const CarRentalSection: React.FC<CarRentalSectionProps> = ({ 
  onOpenEnquiry,
  initialServiceType = 'SELF DRIVE',
  onNavigateToMercedes
}) => {
  const { currency, setCurrency } = useCurrency();
  const [activeOption, setActiveOption] = useState<RentalServiceType>(initialServiceType);
  const [selectedCategory, setSelectedCategory] = useState<'All' | VehicleCategory>('All');
  const [globalPeriod, setGlobalPeriod] = useState<RentalPeriod>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehiclesList, setVehiclesList] = useState<FleetVehicle[]>(FLEET_CATALOG);
  const [, setIsLoadingCars] = useState<boolean>(false);
  const [selectedMediaCar, setSelectedMediaCar] = useState<FleetVehicle | null>(null);
  const [mediaMode, setMediaMode] = useState<'photo' | 'video'>('photo');

  const handleOpenMedia = (car: FleetVehicle, mode: 'photo' | 'video' = 'photo') => {
    setSelectedMediaCar(car);
    setMediaMode(mode);
  };

  // Fetch live fleet data if available, fallback to catalog
  useEffect(() => {
    let isMounted = true;
    const fetchLiveCars = async () => {
      try {
        setIsLoadingCars(true);
        const res = await fetch('/api/cars');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: (FleetVehicle & Record<string, any>)[] = json.data.map((c: any, index: number) => ({
            id: c.id ? String(c.id) : `car_live_${index}_${c.make}_${c.model}`,
            makeModel: c.vehicleName || `${c.make} ${c.model}`,
            category: c.category as VehicleCategory,
            serviceType: (c.serviceType === 'Chauffeur Driven' ? 'CHAUFFEUR DRIVEN' : 'SELF DRIVE') as RentalServiceType,
            serviceAssignment: (c.serviceType || 'Self Drive') as any,
            brand: c.make,
            color: c.color || c.colour || '',
            colour: c.colour || c.color || '',
            year: c.year || 2021,
            bodyType: c.bodyType || c.category,
            horsepower: c.horsepower || '',
            engine: c.engine || '',
            engineCapacity: c.engineCapacity || '',
            length: c.length || '',
            width: c.width || '',
            height: c.height || '',
            rentalPeriod: c.rentalPeriod || 'Monthly',
            seats: Number(c.seats) || 5,
            luggageCapacity: c.luggage || '2 Bags',
            transmission: c.transmission || 'Automatic',
            image: c.image || '',
            gallery: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : (c.image ? [c.image] : []),
            images: Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : (c.image ? [c.image] : []),
            videoUrl: c.videoUrl || c.video || '',
            video: c.videoUrl || c.video || '',
            dailyRateAED: c.dailyPriceAED || c.dailyPrice || 39,
            weeklyRateAED: c.weeklyPriceAED || c.weeklyPrice || 249,
            monthlyRateAED: c.monthlyPriceAED || c.monthlyPrice || 999,
            isQuoteOnly: Boolean(c.getQuoteOption),
            description: c.description || '',
            features: [`${c.seats} Seats`, c.luggage || '2 Bags', c.transmission || 'Automatic']
          }));
          setVehiclesList(mapped as FleetVehicle[]);
        }
      } catch (err) {
        console.warn('Using catalog fleet data', err);
      } finally {
        if (isMounted) setIsLoadingCars(false);
      }
    };

    fetchLiveCars();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialServiceType) {
      setActiveOption(initialServiceType);
    }
  }, [initialServiceType]);

  // Compute solid rates for any car
  const getRates = (car: FleetVehicle) => {
    const daily = car.dailyRateAED && car.dailyRateAED > 0 
      ? car.dailyRateAED 
      : (car.monthlyRateAED ? Math.round(car.monthlyRateAED / 20) : 120);

    const weekly = car.weeklyRateAED && car.weeklyRateAED > 0
      ? car.weeklyRateAED
      : Math.round(daily * 6);

    const monthly = car.monthlyRateAED && car.monthlyRateAED > 0
      ? car.monthlyRateAED
      : Math.round(daily * 20);

    return { daily, weekly, monthly };
  };

  // Filter vehicles based on active option ("SELF DRIVE" vs "CHAUFFEUR DRIVEN"), category, and search query
  const filteredVehicles = vehiclesList.filter((vehicle: FleetVehicle) => {
    // 1. Two clear options: Self Drive vs Chauffeur Driven
    const matchesOption = activeOption === 'SELF DRIVE'
      ? (vehicle.serviceAssignment === 'Self Drive' || vehicle.serviceAssignment === 'Both' || vehicle.serviceType === 'SELF DRIVE')
      : (vehicle.serviceAssignment === 'Chauffeur Driven' || vehicle.serviceAssignment === 'Both' || vehicle.serviceType === 'CHAUFFEUR DRIVEN');
    if (!matchesOption) return false;

    // 2. Category match
    if (selectedCategory !== 'All' && vehicle.category !== selectedCategory) return false;

    // 3. Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesModel = vehicle.makeModel.toLowerCase().includes(q);
      const matchesCategory = vehicle.category.toLowerCase().includes(q);
      const matchesBrand = vehicle.brand?.toLowerCase().includes(q);
      if (!matchesModel && !matchesCategory && !matchesBrand) return false;
    }

    return true;
  });

  const selfDriveCount = vehiclesList.filter(v => 
    v.serviceAssignment === 'Self Drive' || v.serviceAssignment === 'Both' || v.serviceType === 'SELF DRIVE'
  ).length;

  const chauffeurCount = vehiclesList.filter(v => 
    v.serviceAssignment === 'Chauffeur Driven' || v.serviceAssignment === 'Both' || v.serviceType === 'CHAUFFEUR DRIVEN'
  ).length;

  const formatPrice = (rateInAED?: number) => {
    if (!rateInAED) return 'Get Quote';
    if (currency === 'USD') {
      return `$${Math.round(rateInAED / 3.6725).toLocaleString()}`;
    }
    return `AED ${rateInAED.toLocaleString()}`;
  };

  const buildWhatsAppLink = (vehicle: FleetVehicle, period: RentalPeriod, rate: number) => {
    const isChauffeur = activeOption === 'CHAUFFEUR DRIVEN';
    const periodLabel = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly';
    const priceFormatted = formatPrice(rate);
    const text = isChauffeur
      ? `Hello Hotwheels Car Rental, I would like to get a quote on WhatsApp for Chauffeur Driven service: ${vehicle.makeModel} (Airport Transfer, Hourly Hire, Full-Day, or Corporate). Please share the rate for my route.`
      : `Hello Hotwheels Car Rental LLC, I would like to inquire about Self Drive rental for: ${vehicle.makeModel} on a ${periodLabel} basis (${priceFormatted}). Please confirm availability.`;
    return `https://wa.me/${COMPANY_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleEnquire = (vehicle: FleetVehicle, period: RentalPeriod, rate: number) => {
    const periodLabel = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly';
    const priceFormatted = formatPrice(rate);
    const itemLabel = `${vehicle.makeModel} (${activeOption === 'CHAUFFEUR DRIVEN' ? 'Chauffeur Driven' : 'Self Drive'} - ${vehicle.category} - ${periodLabel}: ${priceFormatted})`;
    if (onOpenEnquiry) {
      onOpenEnquiry('car-rental', itemLabel);
    }
  };

  return (
    <section className="py-10 sm:py-12 bg-white" id="car-rental-fleet">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B4DA2]/10 text-[#0B4DA2] text-[11px] font-bold uppercase tracking-wider">
            HOTWHEELS CAR RENTAL LLC
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Vehicle Fleet & Transparent Rates
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Select your preferred rental mode between flexible Self Drive rentals and professional Chauffeur Driven luxury vehicles. Switch between Daily, Weekly, and Monthly rates anytime.
          </p>
        </div>

        {/* TWO CLEAR OPTIONS / TABS: "SELF DRIVE" & "CHAUFFEUR DRIVEN" */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-inner max-w-md w-full sm:w-auto">
            {/* Tab 1: SELF DRIVE */}
            <button
              id="tab-self-drive"
              type="button"
              onClick={() => {
                setActiveOption('SELF DRIVE');
                setSelectedCategory('All');
              }}
              className={`flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeOption === 'SELF DRIVE'
                  ? 'bg-[#0B4DA2] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0A2540] hover:bg-slate-200/60'
              }`}
            >
              <Car className="w-4 h-4 shrink-0" />
              <span className="tracking-wide">SELF DRIVE</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeOption === 'SELF DRIVE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {selfDriveCount}
              </span>
            </button>

            {/* Tab 2: CHAUFFEUR DRIVEN */}
            <button
              id="tab-chauffeur-driven"
              type="button"
              onClick={() => {
                setActiveOption('CHAUFFEUR DRIVEN');
                setSelectedCategory('All');
              }}
              className={`flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeOption === 'CHAUFFEUR DRIVEN'
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0A2540] hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span className="tracking-wide">CHAUFFEUR DRIVEN</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeOption === 'CHAUFFEUR DRIVEN' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {chauffeurCount}
              </span>
            </button>
          </div>
        </div>

        {/* Rental Policy Banner / Mercedes Chauffeur Spotlight */}
        {activeOption === 'SELF DRIVE' ? (
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-2.5 text-xs text-slate-600 max-w-3xl mx-auto">
            <Info className="w-4 h-4 text-[#0B4DA2] shrink-0" />
            <div>
              <strong className="text-[#0A2540] font-semibold">Self-Drive Policy: </strong>
              All self-drive rentals require a refundable security deposit. Mercedes-Benz models (V-Class, Vito, E-Class, C-Class, G-Class) are also available under Self Drive whenever inventory permits.
            </div>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#0A2540] to-[#0B4DA2] text-white flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto shadow-xs">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0 hidden sm:block" />
              <div>
                <span className="text-xs sm:text-sm font-bold block text-white">
                  VIP Mercedes Chauffeur Service
                </span>
                <span className="text-[11px] text-slate-200">
                  Airport Transfer • Hourly Hire • Full-Day Chauffeur • Corporate Transfer with professional drivers.
                </span>
              </div>
            </div>
            {onNavigateToMercedes && (
              <button
                type="button"
                onClick={onNavigateToMercedes}
                className="px-4 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38F1F] text-[#0A2540] font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>View Mercedes Section</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* CONTROLS BAR: Categories + Period Dropdown + Currency + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[34px] ${
                    isSelected
                      ? 'bg-[#0B4DA2] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Period Segmented Toggle, Currency Switcher, Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0">
            {/* Global Rental Period Segmented Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs shrink-0">
              {(['daily', 'weekly', 'monthly'] as RentalPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setGlobalPeriod(period)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer text-xs ${
                    globalPeriod === period
                      ? 'bg-[#0B4DA2] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Currency Selector */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setCurrency('AED')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                  currency === 'AED'
                    ? 'bg-[#0B4DA2] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="United Arab Emirates Dirham"
              >
                <DirhamSymbol className="w-3.5 h-3.5" />
                <span>AED</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                  currency === 'USD'
                    ? 'bg-[#0B4DA2] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="United States Dollar ($)"
              >
                <span>$</span>
                <span>USD</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-52 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search fleet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4DA2]/20 focus:border-[#0B4DA2] transition-colors min-h-[34px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer min-w-[16px] min-h-[16px] flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* VEHICLE CARDS GRID */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-[#F5F7FA] rounded-3xl border border-slate-200 space-y-4">
            <Car className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">No vehicles found</h3>
              <p className="text-xs text-slate-500">Try selecting "All" categories or changing your search terms.</p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs hover:bg-[#083B7D] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredVehicles.map((car, index) => {
              const isChauffeur = activeOption === 'CHAUFFEUR DRIVEN';
              const modeLabel = isChauffeur ? 'Chauffeur Driven' : 'Self Drive';
              const rates = getRates(car);
              
              const currentRate = globalPeriod === 'daily' 
                ? rates.daily 
                : globalPeriod === 'weekly' 
                  ? rates.weekly 
                  : rates.monthly;

              const periodSuffix = globalPeriod === 'daily' ? 'day' : globalPeriod === 'weekly' ? 'week' : 'month';

              return (
                <div
                  key={car.id || `veh_${index}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* 1. CAR IMAGE CONTAINER (CLEAN IMAGE DISPLAY OR NEUTRAL PLACEHOLDER TILE) */}
                  <div 
                    className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden group/img cursor-pointer flex items-center justify-center"
                    onClick={() => handleOpenMedia(car, 'photo')}
                    title={`Click to view ${car.makeModel} details`}
                  >
                    {car.image ? (
                      <img
                        src={car.image}
                        alt={car.makeModel}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1.5">
                        <Car className="w-10 h-10 text-slate-500 stroke-[1.5]" />
                        <span className="text-xs font-bold text-slate-300">No Image Uploaded</span>
                        <span className="text-[10px] text-slate-500">Image upload available via Admin</span>
                      </div>
                    )}

                    {/* Top Badges: Self Drive / Chauffeur Driven & Category */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap pointer-events-none z-10">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        isChauffeur ? 'bg-[#0A2540] text-[#C9A227]' : 'bg-[#0B4DA2] text-white'
                      }`}>
                        {modeLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 text-[#0A2540] shadow-xs backdrop-blur-xs">
                        {car.category}
                      </span>
                    </div>

                    {/* Top Right Specs Badges: Video / Color */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 flex-wrap">
                      {(car.videoUrl || (car as any).video) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMedia(car, 'video');
                          }}
                          className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-md flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                          title="Watch Walkaround Video"
                        >
                          <Film className="w-3 h-3 text-amber-300" />
                          <span>Watch Video</span>
                        </button>
                      )}
                      {(car as any).color && (
                        <div className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/20 shadow-md uppercase">
                          {(car as any).color}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. CARD CONTENT: Make & Model, Specs, Rates */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2.5">
                      {/* Make & Model + Color/Year */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          <span>{car.category} • {modeLabel}</span>
                          {(car as any).year && <span>{(car as any).year} Model</span>}
                        </div>
                        <h3 
                          onClick={() => handleOpenMedia(car, 'photo')}
                          className="text-base sm:text-[17px] font-bold text-[#0A2540] hover:text-[#0B4DA2] leading-snug tracking-tight cursor-pointer transition-colors"
                        >
                          {car.makeModel} {(car as any).color ? `— ${(car as any).color}` : ''}
                        </h3>
                      </div>

                      {/* Full Specifications Grid */}
                      <div className="grid grid-cols-2 gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 font-medium">
                        {(car as any).color && (
                          <div><span className="text-slate-400 font-normal">Color: </span><span className="font-semibold text-slate-900">{(car as any).color}</span></div>
                        )}
                        {(car as any).year && (
                          <div><span className="text-slate-400 font-normal">Year: </span><span className="font-semibold text-slate-900">{(car as any).year}</span></div>
                        )}
                        {(car as any).horsepower && (
                          <div><span className="text-slate-400 font-normal">Power: </span><span className="font-semibold text-slate-900">{(car as any).horsepower}</span></div>
                        )}
                        {(car as any).engine && (
                          <div><span className="text-slate-400 font-normal">Engine: </span><span className="font-semibold text-slate-900">{(car as any).engine}</span></div>
                        )}
                        {(car as any).engineCapacity && (
                          <div><span className="text-slate-400 font-normal">Capacity: </span><span className="font-semibold text-slate-900">{(car as any).engineCapacity}</span></div>
                        )}
                        <div><span className="text-slate-400 font-normal">Seats: </span><span className="font-semibold text-slate-900">{car.seats} Persons</span></div>
                        {(car as any).bodyType && (
                          <div><span className="text-slate-400 font-normal">Body Type: </span><span className="font-semibold text-slate-900">{(car as any).bodyType}</span></div>
                        )}
                        {(car as any).length && (
                          <div><span className="text-slate-400 font-normal">Length: </span><span className="font-semibold text-slate-900">{(car as any).length}</span></div>
                        )}
                        {(car as any).width && (
                          <div><span className="text-slate-400 font-normal">Width: </span><span className="font-semibold text-slate-900">{(car as any).width}</span></div>
                        )}
                        {(car as any).height && (
                          <div><span className="text-slate-400 font-normal">Height: </span><span className="font-semibold text-slate-900">{(car as any).height}</span></div>
                        )}
                      </div>

                      {/* RENTAL RATES SECTION */}
                      {isChauffeur ? (
                        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                                Chauffeur Transfer Rate
                              </span>
                              <div className="text-xs sm:text-[13px] font-bold text-[#0A2540]">
                                Quote Based on Route & Hours
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/70">
                              Instant Quote
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg font-bold text-[#0A2540] tracking-tight">
                                <PriceDisplay amountInAED={currentRate} />
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                / {periodSuffix}
                              </span>
                            </div>
                            {globalPeriod === 'weekly' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/70">
                                Save ~15%
                              </span>
                            )}
                            {globalPeriod === 'monthly' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/70">
                                Best Value (~35% Off)
                              </span>
                            )}
                            {globalPeriod === 'daily' && (
                              <span className="text-[11px] font-medium text-slate-400">
                                Standard Daily
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons: Photo Gallery & Booking Actions */}
                    <div className="space-y-2 pt-1">
                      {/* Direct Photo Gallery Button (Opens Pop-up) */}
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenMedia(car, 'photo')}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/90 shadow-2xs"
                          title="Open pop-up with all photos"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#0B4DA2]" />
                          <span>View Photo Gallery</span>
                        </button>
                      </div>

                      {/* Primary WhatsApp & Enquire buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={buildWhatsAppLink(car, globalPeriod, currentRate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs transition-all shadow-xs hover:shadow flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                        >
                          <WhatsAppOfficialIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleEnquire(car, globalPeriod, currentRate)}
                          className="py-2.5 px-3 rounded-xl bg-[#0B4DA2] hover:bg-[#083B7D] text-white font-semibold text-xs transition-all shadow-xs hover:shadow flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                        >
                          <Send className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Enquire</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Media & Video Gallery Modal */}
        <CarVideoModal
          isOpen={!!selectedMediaCar}
          onClose={() => setSelectedMediaCar(null)}
          initialMode={mediaMode}
          car={selectedMediaCar ? {
            make: selectedMediaCar.brand || selectedMediaCar.makeModel.split(' ')[0],
            model: selectedMediaCar.makeModel,
            category: selectedMediaCar.category,
            image: selectedMediaCar.image,
            gallery: selectedMediaCar.gallery || selectedMediaCar.images,
            videoUrl: selectedMediaCar.videoUrl || selectedMediaCar.video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            dailyPriceAED: selectedMediaCar.dailyRateAED,
            seats: selectedMediaCar.seats,
            luggage: selectedMediaCar.luggageCapacity,
            description: selectedMediaCar.description,
            serviceType: selectedMediaCar.serviceType
          } : null}
          onOpenEnquiry={onOpenEnquiry}
        />

      </div>
    </section>
  );
};
