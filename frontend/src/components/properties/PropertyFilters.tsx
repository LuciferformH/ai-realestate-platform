import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  X,
  Home,
  Building2,
  Warehouse,
  LandPlot,
  Store,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CITIES, PROPERTY_TYPES } from '@/lib/constants';
import type { PropertyFilters } from '@/types';

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFilterChange: (key: keyof PropertyFilters, value: string | number | boolean | undefined) => void;
  onClearAll: () => void;
  activeCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

const propertyTypeIcons: Record<string, React.ReactNode> = {
  house: <Home className="h-4 w-4" />,
  apartment: <Building2 className="h-4 w-4" />,
  condo: <Building className="h-4 w-4" />,
  townhouse: <Warehouse className="h-4 w-4" />,
  land: <LandPlot className="h-4 w-4" />,
  commercial: <Store className="h-4 w-4" />,
  villa: <Building2 className="h-4 w-4" />,
  plot: <LandPlot className="h-4 w-4" />,
  penthouse: <Building className="h-4 w-4" />,
  studio: <Home className="h-4 w-4" />,
  duplex: <Warehouse className="h-4 w-4" />,
};

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.06] pb-4 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-white/80"
      >
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 100000,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  step?: number;
}) {
  const formatLabel = (val: number) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/10">
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
      </div>
      <div className="relative mt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= value[1]) onChange([val, value[1]]);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= value[0]) onChange([value[0], val]);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function PropertyFilters({
  filters,
  onFilterChange,
  onClearAll,
  activeCount,
  isOpen,
  onToggle,
}: PropertyFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.min_price ?? 0,
    filters.max_price ?? 100000000,
  ]);

  const handlePriceChange = useCallback(
    (val: [number, number]) => {
      setPriceRange(val);
      onFilterChange('min_price', val[0] > 0 ? val[0] : undefined);
      onFilterChange('max_price', val[1] < 100000000 ? val[1] : undefined);
    },
    [onFilterChange]
  );

  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5];

  const filterContent = (
    <div className="space-y-4">
      {/* City */}
      <FilterSection title="City">
        <select
          value={filters.city ?? ''}
          onChange={(e) => onFilterChange('city', e.target.value || undefined)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="" className="bg-slate-800">All Cities</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.name} className="bg-slate-800">
              {c.name}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Locality */}
      <FilterSection title="Locality" defaultOpen={false}>
        <input
          type="text"
          placeholder="Search locality..."
          value={filters.search ?? ''}
          onChange={(e) => onFilterChange('search', e.target.value || undefined)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRangeSlider
          min={0}
          max={100000000}
          value={priceRange}
          onChange={handlePriceChange}
          step={500000}
        />
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((num) => (
            <button
              key={num}
              onClick={() => onFilterChange('bedrooms', filters.bedrooms === num ? undefined : num)}
              className={cn(
                'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-all',
                filters.bedrooms === num
                  ? 'border-primary-500/50 bg-primary-500/20 text-primary-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
              )}
            >
              {num}{num === 6 ? '+' : ''}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Bathrooms */}
      <FilterSection title="Bathrooms">
        <div className="flex flex-wrap gap-2">
          {bathroomOptions.map((num) => (
            <button
              key={num}
              onClick={() => onFilterChange('bathrooms', filters.bathrooms === num ? undefined : num)}
              className={cn(
                'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-all',
                filters.bathrooms === num
                  ? 'border-primary-500/50 bg-primary-500/20 text-primary-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
              )}
            >
              {num}{num === 5 ? '+' : ''}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type">
        <div className="space-y-1.5">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                filters.property_type === type.value
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <input
                type="radio"
                name="property_type"
                value={type.value}
                checked={filters.property_type === type.value}
                onChange={(e) => onFilterChange('property_type', e.target.value || undefined)}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  filters.property_type === type.value
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-white/5 text-white/40'
                )}
              >
                {propertyTypeIcons[type.value] || <Home className="h-4 w-4" />}
              </span>
              <span className="font-medium">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Furnished */}
      <FilterSection title="Furnishing" defaultOpen={false}>
        <div className="flex gap-2">
          {[
            { label: 'Any', value: undefined },
            { label: 'Furnished', value: true },
            { label: 'Unfurnished', value: false },
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => onFilterChange('furnished', option.value)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                filters.furnished === option.value
                  ? 'border-primary-500/50 bg-primary-500/20 text-primary-400'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Clear All */}
      {activeCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClearAll}
          className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
        >
          Clear All Filters ({activeCount})
        </motion.button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Filters</h3>
            {activeCount > 0 && (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto border-r border-white/[0.06] bg-slate-900/95 p-5 backdrop-blur-xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={onToggle}
                  className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
