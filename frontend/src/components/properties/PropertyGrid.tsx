import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Building2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import PropertyCard from './PropertyCard';
import type { Property } from '@/types';

interface PropertyGridProps {
  properties: Property[];
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const listRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.04 },
  }),
};

function PropertyListRow({ property, index }: { property: Property; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={listRowVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ x: 4 }}
      className="group"
    >
      <a
        href={`/properties/${property.id}`}
        className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.06] sm:p-4"
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-8 w-8 text-white/20" />
            </div>
          )}
          {property.is_featured && (
            <span className="absolute left-1.5 top-1.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white transition-colors group-hover:text-primary-400">
                {property.title}
              </h3>
              <p className="mt-0.5 truncate text-sm text-white/50">
                {property.locality}, {property.city}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-bold text-white">{formatCurrency(property.price)}</p>
              <p className="text-xs text-white/40">
                {formatCurrency(Math.round(property.price / property.area))}/sqft
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-white/50">
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.area} sqft</span>
            {property.parking > 0 && <span>{property.parking} Parking</span>}
            {property.furnished && (
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">Furnished</span>
            )}
            <span className="rounded bg-white/5 px-1.5 py-0.5">{property.property_type}</span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

export default function PropertyGrid({ properties, view, onViewChange }: PropertyGridProps) {
  return (
    <div>
      {/* View Toggle */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => onViewChange('grid')}
          className={cn(
            'rounded-lg p-2 transition-all',
            view === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-white/40 hover:bg-white/10 hover:text-white'
          )}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            'rounded-lg p-2 transition-all',
            view === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-white/40 hover:bg-white/10 hover:text-white'
          )}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {properties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {properties.map((property, i) => (
              <PropertyListRow key={property.id} property={property} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
