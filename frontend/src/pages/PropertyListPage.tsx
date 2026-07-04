import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, X, BarChart3 } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { cn } from '@/lib/utils';
import { CITIES, SORT_OPTIONS } from '@/lib/constants';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyGrid from '@/components/properties/PropertyGrid';
import PropertyComparison from '@/components/properties/PropertyComparison';
import { Pagination } from '@/components/ui/Pagination';
import type { PropertyFilters as PropertyFiltersType, Property } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          <div className="h-52 animate-pulse bg-white/[0.05]" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
            <div className="flex gap-4">
              <div className="h-3 w-12 animate-pulse rounded bg-white/[0.05]" />
              <div className="h-3 w-12 animate-pulse rounded bg-white/[0.05]" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/[0.05]" />
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <div className="h-6 w-1/3 animate-pulse rounded bg-white/[0.05]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.05]">
        <Search className="h-8 w-8 text-white/20" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">No properties found</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-white/40">
        Try adjusting your filters or search criteria to find properties that match your requirements.
      </p>
    </motion.div>
  );
}

export default function PropertyListPage() {
  const [filters, setFilters] = useState<PropertyFiltersType>({ page: 1, per_page: 12 });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showComparison, setShowComparison] = useState(false);

  const { data, isLoading } = useProperties(filters);

  const handleFilterChange = useCallback(
    (key: keyof PropertyFiltersType, value: string | number | boolean | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setFilters({ page: 1, per_page: 12 });
    setSearch('');
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.search) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.property_type) count++;
    if (filters.furnished !== undefined) count++;
    return count;
  }, [filters]);

  const properties = data?.items ?? [];
  const totalResults = data?.total ?? 0;
  const totalPages = data?.pages ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Properties</h1>
                <p className="mt-1 text-sm text-white/50">
                  {isLoading
                    ? 'Loading...'
                    : `${totalResults.toLocaleString()} properties found`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                    showComparison
                      ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  Compare
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search + Filter Toggle */}
          <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search properties by name or locality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', search || undefined)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    handleFilterChange('search', undefined);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/30 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                  showFilters || activeFilterCount > 0
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="relative">
                <select
                  value={filters.sort_by ?? ''}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value || undefined)}
                  className="flex appearance-none items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-8 text-sm font-medium text-white/60 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="" className="bg-slate-800">
                    Sort By
                  </option>
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-slate-800">
                      {s.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>
          </motion.div>

          {/* Active Filter Pills */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex flex-wrap gap-2"
              >
                {filters.city && (
                  <FilterPill label={filters.city} onRemove={() => handleFilterChange('city', undefined)} />
                )}
                {filters.search && (
                  <FilterPill
                    label={`"${filters.search}"`}
                    onRemove={() => {
                      setSearch('');
                      handleFilterChange('search', undefined);
                    }}
                  />
                )}
                {filters.bedrooms && (
                  <FilterPill
                    label={`${filters.bedrooms}+ Bed`}
                    onRemove={() => handleFilterChange('bedrooms', undefined)}
                  />
                )}
                {filters.bathrooms && (
                  <FilterPill
                    label={`${filters.bathrooms}+ Bath`}
                    onRemove={() => handleFilterChange('bathrooms', undefined)}
                  />
                )}
                {filters.property_type && (
                  <FilterPill
                    label={filters.property_type}
                    onRemove={() => handleFilterChange('property_type', undefined)}
                  />
                )}
                {filters.furnished !== undefined && (
                  <FilterPill
                    label={filters.furnished ? 'Furnished' : 'Unfurnished'}
                    onRemove={() => handleFilterChange('furnished', undefined)}
                  />
                )}
                <button
                  onClick={handleClearAll}
                  className="rounded-full px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content with Sidebar */}
          <div className="flex gap-6">
            {/* Filters Sidebar (Desktop) */}
            {!showComparison && (
              <PropertyFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                activeCount={activeFilterCount}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
            )}

            {/* Property Grid */}
            <motion.div variants={itemVariants} className="min-w-0 flex-1">
              {showComparison ? (
                <PropertyComparison availableProperties={properties} />
              ) : isLoading ? (
                <LoadingSkeleton />
              ) : properties.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <PropertyGrid properties={properties} view={view} onViewChange={setView} />
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={filters.page ?? 1}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalResults}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400"
    >
      {label}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 transition-colors hover:bg-primary-500/20"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.span>
  );
}
