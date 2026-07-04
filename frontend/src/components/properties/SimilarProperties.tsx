import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Building2, MapPin, BedDouble, Bath, Ruler } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Property } from '@/types';

interface SimilarPropertiesProps {
  properties: Property[];
}

export default function SimilarProperties({ properties }: SimilarPropertiesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [properties]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!properties.length) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Similar Properties</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="-mx-2 flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {properties.map((property, i) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="w-72 flex-shrink-0 snap-start sm:w-80"
          >
            <a
              href={`/properties/${property.id}`}
              className="group block overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.06]"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                    <Building2 className="h-12 w-12 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-2 right-2">
                  <span className="inline-block rounded-md bg-primary-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                    {formatCurrency(property.price)}
                  </span>
                </div>
                {property.is_featured && (
                  <span className="absolute left-2 top-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-primary-400">
                  {property.title}
                </h4>
                <div className="mt-1 flex items-center gap-1 text-xs text-white/50">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {property.locality}, {property.city}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3 w-3" /> {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3 w-3" /> {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" /> {property.area} sqft
                  </span>
                </div>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
