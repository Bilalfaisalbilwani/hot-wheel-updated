import React, { createContext, useContext, useState } from 'react';
import { DirhamSymbol } from '../components/DirhamSymbol';

export type SupportedCurrency = 'AED' | 'USD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateFromAED: number; // Conversion multiplier from base AED
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    rateFromAED: 1.0
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromAED: 0.2723 // Official UAE central bank peg ~3.6725 AED per USD
  }
};

/**
 * CurrencySymbol component
 * Renders the official UAE Dirham symbol (U+20C3 SVG) for AED, or '$' for USD.
 */
export const CurrencySymbol: React.FC<{
  currency?: SupportedCurrency | string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
}> = ({ currency = 'AED', className = '', size = 'custom' }) => {
  if (currency === 'USD') {
    return <span className={`inline-block font-semibold ${className}`}>$</span>;
  }
  return <DirhamSymbol size={size} className={className} />;
};

/**
 * PriceDisplay component
 * Formats and renders any price in AED (or converted to USD) with the official UAE Dirham Symbol.
 * Example output:
 * [Dirham Symbol] 1,200
 * [Dirham Symbol] 5,500
 * [Dirham Symbol] 12,000
 */
export const PriceDisplay: React.FC<{
  amountInAED?: number;
  forcedCurrency?: SupportedCurrency | string;
  className?: string;
  symbolClassName?: string;
  showPrefix?: boolean;
}> = ({
  amountInAED = 0,
  forcedCurrency,
  className = '',
  symbolClassName = '',
  showPrefix = true
}) => {
  const { currency: contextCurrency, convertPrice } = useCurrency();
  const activeCurrency = forcedCurrency || contextCurrency;

  if (amountInAED <= 0 || isNaN(amountInAED)) {
    return <span className={className}>Upon Request</span>;
  }

  const numericValue = activeCurrency === 'AED' ? amountInAED : convertPrice(amountInAED);
  const formattedNumber = numericValue.toLocaleString();

  return (
    <span className={`inline-flex items-center gap-1 font-bold ${className}`}>
      {showPrefix && (
        <CurrencySymbol
          currency={activeCurrency}
          className={`shrink-0 ${symbolClassName}`}
        />
      )}
      <span>{formattedNumber}</span>
    </span>
  );
};

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (amountInAED: number, showCode?: boolean) => string;
  convertPrice: (amountInAED: number) => number;
  renderPrice: (amountInAED: number, options?: { className?: string; symbolClassName?: string }) => React.ReactNode;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    const saved = localStorage.getItem('zone_currency_pref');
    if (saved && (saved === 'AED' || saved === 'USD')) {
      return saved as SupportedCurrency;
    }
    return 'AED';
  });

  const setCurrency = (newCurr: SupportedCurrency) => {
    setCurrencyState(newCurr);
    localStorage.setItem('zone_currency_pref', newCurr);
  };

  const convertPrice = (amountInAED: number): number => {
    const config = CURRENCIES[currency] || CURRENCIES.AED;
    return Math.round(amountInAED * config.rateFromAED);
  };

  // Plaintext string representation (useful for WhatsApp URLs, metadata, titles)
  const formatPrice = (amountInAED: number, showCode = true): string => {
    const config = CURRENCIES[currency] || CURRENCIES.AED;
    const converted = convertPrice(amountInAED);
    
    if (currency === 'AED') {
      return showCode ? `AED ${amountInAED.toLocaleString()}` : `${amountInAED.toLocaleString()}`;
    }
    
    return showCode 
      ? `${config.symbol}${converted.toLocaleString()} USD`
      : `${config.symbol}${converted.toLocaleString()}`;
  };

  const renderPrice = (
    amountInAED: number,
    options?: { className?: string; symbolClassName?: string }
  ): React.ReactNode => {
    return (
      <PriceDisplay
        amountInAED={amountInAED}
        className={options?.className}
        symbolClassName={options?.symbolClassName}
      />
    );
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, renderPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencySelector: React.FC<{ className?: string; variant?: 'pill' | 'select' }> = ({ className = '', variant = 'pill' }) => {
  const { currency, setCurrency } = useCurrency();

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold ${className}`}>
        <button
          type="button"
          onClick={() => setCurrency('AED')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            currency === 'AED'
              ? 'bg-[#0B4DA2] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Set currency to UAE Dirham (AED)"
        >
          <DirhamSymbol className="w-3.5 h-3.5" />
          <span>AED</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            currency === 'USD'
              ? 'bg-[#0B4DA2] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Set currency to US Dollar (USD)"
        >
          <span>$</span>
          <span>USD</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
        className="bg-slate-100 hover:bg-slate-200 text-[#0A2540] text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4DA2] cursor-pointer transition-colors"
        aria-label="Select Display Currency"
      >
        <option value="AED">AED (UAE Dirham)</option>
        <option value="USD">USD ($)</option>
      </select>
    </div>
  );
};
