import { 
  getCountries, 
  getCountryCallingCode, 
  CountryCode, 
  parsePhoneNumberFromString,
  AsYouType
} from 'libphonenumber-js';

export interface CountryMetadata {
  code: CountryCode;
  name: string;
  dialCode: string; // e.g. "+92"
  placeholder?: string;
  popular?: boolean;
}

const regionNames = typeof Intl !== 'undefined' && (Intl as any).DisplayNames 
  ? new (Intl as any).DisplayNames(['en'], { type: 'region' })
  : null;

// Clean friendly names for edge cases or territories
const CUSTOM_NAMES: Partial<Record<CountryCode, string>> = {
  PK: 'Pakistan',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States',
  SA: 'Saudi Arabia',
  IN: 'India',
  OM: 'Oman',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'Bahrain',
  CA: 'Canada',
  AU: 'Australia',
  EG: 'Egypt',
  PH: 'Philippines',
  XK: 'Kosovo',
  PS: 'Palestine',
  TW: 'Taiwan',
  RU: 'Russia',
  KR: 'South Korea',
  KP: 'North Korea',
  CD: 'Congo (DRC)',
  CG: 'Congo (Republic)',
  TZ: 'Tanzania',
  VE: 'Venezuela',
  BO: 'Bolivia',
  IR: 'Iran',
  SY: 'Syria',
  LA: 'Laos',
  VN: 'Vietnam'
};

// Popular countries prioritized at top of list
export const POPULAR_COUNTRY_CODES: CountryCode[] = [
  'PK', // Pakistan (Default)
  'AE', // UAE
  'SA', // Saudi Arabia
  'GB', // United Kingdom
  'US', // United States
  'IN', // India
  'OM', // Oman
  'QA', // Qatar
  'KW', // Kuwait
  'BH', // Bahrain
  'CA', // Canada
  'AU', // Australia
  'EG', // Egypt
  'PH', // Philippines
];

const popularSet = new Set(POPULAR_COUNTRY_CODES);

/**
 * Dynamically generated list of all 245+ ISO countries/territories supported by libphonenumber-js
 */
export const ALL_COUNTRIES: CountryMetadata[] = (() => {
  const countryCodes = getCountries();

  const list = countryCodes
    .map((code): CountryMetadata | null => {
      let dial = '';
      try {
        dial = `+${getCountryCallingCode(code)}`;
      } catch {
        dial = '';
      }

      if (!dial) return null;

      let name = CUSTOM_NAMES[code];
      if (!name && regionNames) {
        try {
          name = regionNames.of(code);
        } catch {
          name = code;
        }
      }
      if (!name) name = code;

      return {
        code,
        name,
        dialCode: dial,
        popular: popularSet.has(code)
      };
    })
    .filter((c): c is CountryMetadata => c !== null);

  // Sort alphabetically by name
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
})();

/**
 * Quick index maps for high performance lookups
 */
export const COUNTRY_BY_CODE = new Map<string, CountryMetadata>();
export const COUNTRIES_BY_DIAL = new Map<string, CountryMetadata[]>();

ALL_COUNTRIES.forEach((c) => {
  COUNTRY_BY_CODE.set(c.code.toUpperCase(), c);
  const existing = COUNTRIES_BY_DIAL.get(c.dialCode) || [];
  existing.push(c);
  COUNTRIES_BY_DIAL.set(c.dialCode, existing);
});

/**
 * Get country metadata by ISO code (defaults to 'PK')
 */
export const getCountryByCode = (code?: string): CountryMetadata => {
  if (!code) return COUNTRY_BY_CODE.get('PK') || ALL_COUNTRIES[0];
  return COUNTRY_BY_CODE.get(code.toUpperCase()) || COUNTRY_BY_CODE.get('PK') || ALL_COUNTRIES[0];
};

/**
 * Parses an arbitrary raw value using libphonenumber-js and splits into CountryMetadata + localDigits.
 * If raw is empty or unparsable, falls back gracefully to defaultCountry ('PK').
 */
export const parsePhoneNumber = (
  raw: string, 
  fallbackCountryCode: CountryCode = 'PK'
): { country: CountryMetadata; localDigits: string; normalized: string } => {
  const fallback = getCountryByCode(fallbackCountryCode);

  if (!raw || !raw.trim()) {
    return { country: fallback, localDigits: '', normalized: '' };
  }

  const trimmed = raw.trim();

  // 1. Try parsing with libphonenumber-js directly
  try {
    const parsed = parsePhoneNumberFromString(trimmed, fallbackCountryCode);
    if (parsed) {
      const detectedCountry = parsed.country ? getCountryByCode(parsed.country) : fallback;
      const cleanLocal = parsed.nationalNumber || '';
      return {
        country: detectedCountry,
        localDigits: cleanLocal,
        normalized: parsed.number || `${detectedCountry.dialCode}${cleanLocal}`
      };
    }
  } catch {
    // continue to fallback heuristic
  }

  // 2. Fallback heuristic: check if starts with +dialCode
  if (trimmed.startsWith('+')) {
    // Sort all countries by dial code length descending
    const sorted = [...ALL_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.dialCode)) {
        const rest = trimmed.slice(c.dialCode.length).replace(/\D/g, '').replace(/^0+/, '');
        return {
          country: c,
          localDigits: rest,
          normalized: rest ? `${c.dialCode}${rest}` : ''
        };
      }
    }
  }

  // 3. Digits-only local under fallback country
  const digitsOnly = trimmed.replace(/\D/g, '').replace(/^0+/, '');
  return {
    country: fallback,
    localDigits: digitsOnly,
    normalized: digitsOnly ? `${fallback.dialCode}${digitsOnly}` : ''
  };
};

/**
 * Normalizes country + local digits into international format (e.g. +923315424466)
 */
export const normalizeInternationalNumber = (
  countryCode: CountryCode, 
  localDigits: string
): string => {
  const cleanDigits = localDigits.replace(/\D/g, '').replace(/^0+/, '');
  if (!cleanDigits) return '';

  const country = getCountryByCode(countryCode);
  
  // Try formatting with libphonenumber-js for canonical validation
  try {
    const parsed = parsePhoneNumberFromString(cleanDigits, countryCode);
    if (parsed && parsed.isValid()) {
      return parsed.number; // e.164 canonical e.g. +923315424466
    }
  } catch {
    // fallback
  }

  return `${country.dialCode}${cleanDigits}`;
};
