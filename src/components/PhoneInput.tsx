import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CountryCode } from 'libphonenumber-js';
import * as Flags from 'country-flag-icons/react/3x2';
import { 
  ALL_COUNTRIES, 
  CountryMetadata, 
  parsePhoneNumber, 
  normalizeInternationalNumber,
  getCountryByCode,
  POPULAR_COUNTRY_CODES
} from '../data/countryCodes';
import { ChevronDown, Search, X, Check, Phone } from 'lucide-react';
import { WhatsAppOfficialIcon } from './WhatsAppFloat';

/**
 * High-definition vector SVG flag component (Zero emoji flags)
 */
export const CountryFlag: React.FC<{ code: string; className?: string; title?: string }> = ({ 
  code, 
  className = 'w-4 h-3', 
  title 
}) => {
  const upper = code.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[upper];
  
  if (!FlagComponent) {
    return (
      <span className={`inline-flex items-center justify-center bg-slate-200 text-slate-700 text-[9px] font-bold rounded-2xs border border-slate-300 shrink-0 ${className}`}>
        {upper.slice(0, 2)}
      </span>
    );
  }
  
  return (
    <FlagComponent 
      className={`inline-block shadow-2xs rounded-2xs border border-black/10 shrink-0 object-cover ${className}`} 
      title={title || upper} 
    />
  );
};

export interface PhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (normalizedValue: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  defaultCountry?: CountryCode; // Defaults to 'PK' as requested
  className?: string;
  iconType?: 'phone' | 'whatsapp' | 'none';
  autoComplete?: string;
  usePortal?: boolean; // Portal dropdown to document.body to prevent clipping by parent overflow containers
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  placeholder,
  defaultCountry = 'PK', // Default: Pakistan (+92)
  className = '',
  iconType = 'none',
  autoComplete = 'tel',
  usePortal = false
}) => {
  // Parse incoming value with defaultCountry = 'PK'
  const parsed = useMemo(() => {
    return parsePhoneNumber(value, defaultCountry);
  }, [value, defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryMetadata>(parsed.country);
  const [localNumber, setLocalNumber] = useState<string>(parsed.localDigits);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value && value.trim()) {
      const nextParsed = parsePhoneNumber(value, defaultCountry);
      setSelectedCountry(nextParsed.country);
      setLocalNumber(nextParsed.localDigits);
    } else if (!value) {
      setLocalNumber('');
    }
  }, [value, defaultCountry]);

  // Calculate dropdown position when using portal
  const updateDropdownCoords = useCallback(() => {
    const triggerEl = triggerButtonRef.current || containerRef.current;
    if (!triggerEl || typeof window === 'undefined') return;

    const rect = triggerEl.getBoundingClientRect();
    // Keep dropdown opening strictly DOWNWARD from the phone-number field
    const top = rect.bottom + 4;

    // Fixed dropdown width with mobile screen boundaries
    const dropdownWidth = 280;
    const padding = 12;
    const viewportWidth = window.innerWidth;

    let left = rect.left;
    if (left + dropdownWidth > viewportWidth - padding) {
      left = Math.max(padding, viewportWidth - dropdownWidth - padding);
    }
    if (left < padding) {
      left = padding;
    }

    setDropdownCoords({ top, left });
  }, []);

  // Recalculate position on scroll & window resize
  useEffect(() => {
    if (!isDropdownOpen || !usePortal) return;

    updateDropdownCoords();

    const handleScrollOrResize = () => {
      updateDropdownCoords();
    };

    // Use capture: true to catch scroll events from parent scrollable elements (like modal dialogs)
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isDropdownOpen, usePortal, updateDropdownCoords]);

  // Layout effect to ensure initial position is calculated before paint
  useLayoutEffect(() => {
    if (isDropdownOpen && usePortal) {
      updateDropdownCoords();
    }
  }, [isDropdownOpen, usePortal, updateDropdownCoords]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);

      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
    }
  }, [isDropdownOpen]);

  // Search filter across complete 245+ ISO dataset
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.dialCode.replace('+', '').includes(q)
    );
  }, [searchQuery]);

  // Popular list (Pakistan, UAE, Saudi Arabia, UK, USA, etc.)
  const popularList = useMemo(() => {
    if (searchQuery.trim()) return [];
    return POPULAR_COUNTRY_CODES
      .map(code => getCountryByCode(code))
      .filter(Boolean);
  }, [searchQuery]);

  // Handle country selection
  const handleSelectCountry = (country: CountryMetadata) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    // Recalculate normalized value with current local digits
    const normalized = normalizeInternationalNumber(country.code, localNumber);
    onChange(normalized);

    // Re-focus local number input
    setTimeout(() => {
      localInputRef.current?.focus();
    }, 40);
  };

  // Handle local number text input
  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Auto-detect pasted full international numbers (starts with + or 00)
    if (rawVal.startsWith('+') || rawVal.startsWith('00')) {
      const parsedPaste = parsePhoneNumber(rawVal, selectedCountry.code);
      setSelectedCountry(parsedPaste.country);
      setLocalNumber(parsedPaste.localDigits);
      onChange(parsedPaste.normalized);
      return;
    }

    // Keep numeric digits
    const digitsOnly = rawVal.replace(/\D/g, '');
    setLocalNumber(digitsOnly);

    // Normalize to international format
    const normalized = normalizeInternationalNumber(selectedCountry.code, digitsOnly);
    onChange(normalized);
  };

  // Handle key navigation (Escape to close)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isDropdownOpen) {
      setIsDropdownOpen(false);
      localInputRef.current?.focus();
    }
  };

  // Example placeholder format
  const activePlaceholder = placeholder || (selectedCountry.code === 'PK' ? '331 5424466' : selectedCountry.code === 'AE' ? '50 123 4567' : '123 456 7890');

  // Dropdown list element
  const dropdownElement = (
    <div 
      ref={dropdownRef}
      role="listbox"
      style={usePortal ? { top: `${dropdownCoords.top}px`, left: `${dropdownCoords.left}px` } : undefined}
      className={`${
        usePortal 
          ? 'fixed z-[99999]' 
          : 'absolute left-0 top-[calc(100%+4px)] z-50'
      } w-[280px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}
    >
      {/* Search Input Box */}
      <div className="p-2 bg-slate-50 border-b border-slate-200">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country, code, or ISO..."
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B4DA2] focus:ring-1 focus:ring-[#0B4DA2]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Country List Scroll Area */}
      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
        {/* Popular section when not searching */}
        {popularList.length > 0 && !searchQuery.trim() && (
          <div className="bg-slate-50/40">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100/70">
              Popular
            </div>
            {popularList.map((country) => {
              const isSelected = selectedCountry.code === country.code;
              return (
                <button
                  key={`pop-${country.code}`}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className={`w-full px-2.5 py-1.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#0B4DA2]/10 text-[#0B4DA2] font-bold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 mr-1.5 flex-1">
                    <CountryFlag code={country.code} className="w-4 h-3 rounded-2xs shrink-0" />
                    <span className="truncate text-xs font-medium text-slate-800">{country.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">{country.code}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs text-slate-600 font-semibold">{country.dialCode}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#0B4DA2]" />}
                  </div>
                </button>
              );
            })}
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100/70 border-t border-slate-200">
              All Countries ({ALL_COUNTRIES.length})
            </div>
          </div>
        )}

        {/* All / Filtered countries */}
        {filteredCountries.length > 0 ? (
          filteredCountries.map((country) => {
            const isSelected = selectedCountry.code === country.code;
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelectCountry(country)}
                className={`w-full px-2.5 py-1.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#0B4DA2]/10 text-[#0B4DA2] font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 mr-1.5 flex-1">
                  <CountryFlag code={country.code} className="w-4 h-3 rounded-2xs shrink-0" />
                  <span className="truncate text-xs font-medium text-slate-800">{country.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">{country.code}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono text-xs text-slate-600 font-semibold">{country.dialCode}</span>
                  {isSelected && <Check className="w-3 h-3 text-[#0B4DA2]" />}
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-5 text-center text-xs text-slate-500">
            No matching country found
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="px-2.5 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span>{ALL_COUNTRIES.length} ISO territories</span>
        <span className="font-mono font-medium text-[#0A2540]">{selectedCountry.code} {selectedCountry.dialCode}</span>
      </div>
    </div>
  );

  return (
    <div className={`space-y-1.5 w-full ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Optional Label */}
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Group: Country Selector Button + Local Number Input */}
      <div 
        className={`relative flex items-stretch w-full rounded-xl border transition-all bg-white min-h-[44px] ${
          error
            ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400/50'
            : isDropdownOpen
              ? 'border-[#0B4DA2] ring-2 ring-[#0B4DA2]/20'
              : 'border-slate-300 focus-within:border-[#0B4DA2] focus-within:ring-2 focus-within:ring-[#0B4DA2]/20'
        } ${disabled ? 'opacity-60 pointer-events-none bg-slate-50' : ''}`}
      >
        {/* Optional Context Icon */}
        {iconType === 'whatsapp' && (
          <div className="pl-3 flex items-center justify-center text-[#25D366] shrink-0 pointer-events-none">
            <WhatsAppOfficialIcon className="w-4 h-4 fill-current" />
          </div>
        )}
        {iconType === 'phone' && (
          <div className="pl-3 flex items-center justify-center text-slate-400 shrink-0 pointer-events-none">
            <Phone className="w-4 h-4" />
          </div>
        )}

        {/* Compact Country Code Trigger (Flag SVG + ISO code + dial code) */}
        <button
          ref={triggerButtonRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!isDropdownOpen && usePortal) {
              updateDropdownCoords();
            }
            setIsDropdownOpen(prev => !prev);
          }}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-label={`Select country code. Currently ${selectedCountry.name} ${selectedCountry.code} ${selectedCountry.dialCode}`}
          className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 border-r border-slate-200 transition-colors shrink-0 cursor-pointer select-none rounded-l-xl ${
            iconType !== 'none' ? 'pl-2' : 'pl-3'
          }`}
        >
          {/* Vector SVG Flag (No Emoji) */}
          <CountryFlag code={selectedCountry.code} className="w-4 h-3 rounded-2xs" />
          
          {/* ISO code + Dial code */}
          <span className="font-semibold text-slate-500 text-[11px]">{selectedCountry.code}</span>
          <span className="font-mono font-bold text-[#0A2540] text-xs">{selectedCountry.dialCode}</span>
          
          {/* Chevron */}
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#0B4DA2]' : ''}`} />
        </button>

        {/* Local Number Text Input (Takes remaining available width) */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <input
            ref={localInputRef}
            id={id || name}
            name={name}
            type="tel"
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            value={localNumber}
            onChange={handleLocalNumberChange}
            placeholder={activePlaceholder}
            className="w-full px-3 py-2 bg-transparent text-sm font-medium text-[#0A2540] placeholder-slate-400 focus:outline-none rounded-r-xl"
          />
          {localNumber && !disabled && (
            <button
              type="button"
              onClick={() => {
                setLocalNumber('');
                onChange('');
                localInputRef.current?.focus();
              }}
              title="Clear number"
              className="mr-2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* =========================================================================
            SEARCHABLE COUNTRY DROPDOWN (Strictly bounded: max ~280px on desktop,
            calc(100vw - 24px) on mobile; portals to document.body when usePortal=true)
            ========================================================================= */}
        {isDropdownOpen && (
          usePortal && typeof document !== 'undefined'
            ? createPortal(dropdownElement, document.body)
            : dropdownElement
        )}
      </div>

      {/* Validation Error Message */}
      {error && (
        <p className="text-[11px] text-rose-600 font-medium mt-1 animate-in fade-in duration-150">
          {error}
        </p>
      )}

      {/* Helper text or International Preview */}
      {!error && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span>{helperText || 'Select country code & enter phone number.'}</span>
          {value && (
            <span className="font-mono text-slate-400 font-medium text-[10px]">
              Intl: {value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

