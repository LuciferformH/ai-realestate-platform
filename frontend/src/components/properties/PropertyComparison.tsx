import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  BedDouble,
  Bath,
  Ruler,
  Car,
  Calendar,
  TrendingUp,
  Shield,
  Building2,
  Star,
} from 'lucide-react';
import { formatCurrency, cn, formatPricePerSqft } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyComparisonProps {
  availableProperties: Property[];
}

interface ComparisonSlot {
  id: number | null;
}

const initialSlots: ComparisonSlot[] = [
  { id: null },
  { id: null },
  { id: null },
  { id: null },
];

function getInvestmentScore(p: Property): number {
  const yieldScore = Math.min(p.rental_yield * 5, 30);
  const growthScore = Math.min(p.market_growth * 3, 30);
  const crimeScore = p.crime_rate < 2 ? 20 : p.crime_rate < 5 ? 10 : 0;
  const ageScore = p.property_age < 5 ? 20 : p.property_age < 15 ? 10 : 0;
  return Math.round(yieldScore + growthScore + crimeScore + ageScore);
}

export default function PropertyComparison({ availableProperties }: PropertyComparisonProps) {
  const [slots, setSlots] = useState<ComparisonSlot[]>(initialSlots);
  const [selectorOpen, setSelectorOpen] = useState<number | null>(null);

  const selectedIds = slots.filter((s) => s.id !== null).map((s) => s.id);
  const selectedProperties = selectedIds
    .map((id) => availableProperties.find((p) => p.id === id))
    .filter(Boolean) as Property[];

  const handleSelect = (slotIndex: number, propertyId: number) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === slotIndex ? { id: propertyId } : slot))
    );
    setSelectorOpen(null);
  };

  const handleRemove = (slotIndex: number) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === slotIndex ? { id: null } : slot))
    );
  };

  const availableForSlot = (excludeIndex: number) => {
    return availableProperties.filter(
      (p) => !selectedIds.includes(p.id) || slots[excludeIndex]?.id === p.id
    );
  };

  const statRows: {
    label: string;
    icon: React.ReactNode;
    getValue: (p: Property) => string;
    highlight?: (values: string[]) => string;
  }[] = [
    {
      label: 'Price',
      icon: <span className="text-emerald-400">₹</span>,
      getValue: (p) => formatCurrency(p.price),
      highlight: (vals) => {
        const nums = vals.map((v) => parseInt(v.replace(/[₹,]/g, '')));
        const minIdx = nums.indexOf(Math.min(...nums));
        return `text-emerald-400`;
      },
    },
    {
      label: 'Price / sqft',
      icon: <Ruler className="h-4 w-4 text-blue-400" />,
      getValue: (p) => formatPricePerSqft(p.price, p.area),
    },
    {
      label: 'Type',
      icon: <Building2 className="h-4 w-4 text-purple-400" />,
      getValue: (p) => p.property_type,
    },
    {
      label: 'Bedrooms',
      icon: <BedDouble className="h-4 w-4 text-primary-400" />,
      getValue: (p) => `${p.bedrooms} BHK`,
    },
    {
      label: 'Bathrooms',
      icon: <Bath className="h-4 w-4 text-cyan-400" />,
      getValue: (p) => String(p.bathrooms),
    },
    {
      label: 'Area',
      icon: <Ruler className="h-4 w-4 text-amber-400" />,
      getValue: (p) => `${p.area} sqft`,
    },
    {
      label: 'Parking',
      icon: <Car className="h-4 w-4 text-orange-400" />,
      getValue: (p) => `${p.parking} spots`,
    },
    {
      label: 'Year Built',
      icon: <Calendar className="h-4 w-4 text-teal-400" />,
      getValue: (p) => String(p.year_built),
    },
    {
      label: 'Property Age',
      icon: <Calendar className="h-4 w-4 text-rose-400" />,
      getValue: (p) => `${p.property_age} years`,
    },
    {
      label: 'Furnished',
      icon: <Star className="h-4 w-4 text-yellow-400" />,
      getValue: (p) => (p.furnished ? 'Yes' : 'No'),
    },
    {
      label: 'Rental Yield',
      icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
      getValue: (p) => `${p.rental_yield}%`,
    },
    {
      label: 'Market Growth',
      icon: <TrendingUp className="h-4 w-4 text-primary-400" />,
      getValue: (p) => `${p.market_growth}%`,
    },
    {
      label: 'Crime Rate',
      icon: <Shield className="h-4 w-4 text-rose-400" />,
      getValue: (p) => String(p.crime_rate),
    },
    {
      label: 'Investment Score',
      icon: <Star className="h-4 w-4 text-amber-400" />,
      getValue: (p) => `${getInvestmentScore(p)}/100`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {slots.map((slot, i) => {
          const property = slot.id ? availableProperties.find((p) => p.id === slot.id) : null;
          return (
            <div key={i} className="relative">
              {property ? (
                <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                  <div className="relative h-24">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/5">
                        <Building2 className="h-8 w-8 text-white/20" />
                      </div>
                    )}
                    <button
                      onClick={() => handleRemove(i)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white/70 transition-colors hover:bg-black/80 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <h4 className="truncate text-xs font-medium text-white">{property.title}</h4>
                    <p className="mt-0.5 text-xs font-bold text-primary-400">
                      {formatCurrency(property.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectorOpen(i)}
                  className="flex h-full min-h-[8rem] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] transition-all hover:border-primary-500/30 hover:bg-white/[0.04]"
                >
                  <Plus className="h-6 w-6 text-white/30" />
                  <span className="text-xs text-white/40">Add Property</span>
                </button>
              )}

              {/* Selector Dropdown */}
              <AnimatePresence>
                {selectorOpen === i && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-xl"
                  >
                    {availableForSlot(i).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(i, p.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-white/5">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Building2 className="h-4 w-4 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{p.title}</p>
                          <p className="text-xs text-white/50">{formatCurrency(p.price)}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectorOpen(null)}
                      className="mt-1 w-full rounded-lg bg-white/5 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      {selectedProperties.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Feature</th>
                {selectedProperties.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-left text-xs font-medium text-white/40">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statRows.map((row, ri) => {
                const values = selectedProperties.map((p) => row.getValue(p));
                const uniqueValues = [...new Set(values)];
                const hasDifference = uniqueValues.length > 1;
                return (
                  <tr
                    key={row.label}
                    className={cn(
                      'border-b border-white/[0.03] transition-colors',
                      ri % 2 === 0 ? 'bg-white/[0.01]' : ''
                    )}
                  >
                    <td className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white/60">
                      {row.icon}
                      {row.label}
                    </td>
                    {selectedProperties.map((p, pi) => (
                      <td
                        key={p.id}
                        className={cn(
                          'px-4 py-2.5 text-xs font-medium',
                          hasDifference ? 'text-white' : 'text-white/60'
                        )}
                      >
                        {values[pi]}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="bg-white/[0.02]">
                <td className="px-4 py-3 text-xs font-medium text-white/60">Location</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-xs text-white/60">
                    {p.locality}, {p.city}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-xs font-medium text-white/60">Amenities</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.amenities || []).slice(0, 3).map((a) => (
                        <span key={a} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                          {a}
                        </span>
                      ))}
                      {(p.amenities || []).length > 3 && (
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                          +{p.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>
      )}

      {selectedProperties.length < 2 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-sm text-white/40">
            Select at least 2 properties to compare
          </p>
        </div>
      )}
    </div>
  );
}
