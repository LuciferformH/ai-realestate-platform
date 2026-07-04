import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BedDouble,
  Bath,
  Ruler,
  Car,
  MapPin,
  Heart,
  Building2,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const fallbackGradients = [
  'from-blue-900/60 to-purple-900/60',
  'from-teal-900/60 to-emerald-900/60',
  'from-rose-900/60 to-pink-900/60',
  'from-amber-900/60 to-orange-900/60',
  'from-indigo-900/60 to-violet-900/60',
];

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [favorited, setFavorited] = useState(false);

  const images = property.images?.length ? property.images : [];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    },
    [images.length]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    },
    [images.length]
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFavorited((prev) => !prev);
    },
    []
  );

  const gradient = fallbackGradients[index % fallbackGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-300 group-hover:border-white/[0.12] group-hover:shadow-xl group-hover:shadow-black/20">
          {/* Image Section */}
          <div className="relative h-52 overflow-hidden">
            {images.length > 0 ? (
              <div className="relative h-full w-full">
                <img
                  src={images[currentImage]}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            ) : (
              <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br', gradient)}>
                <Building2 className="h-14 w-14 text-white/20" />
              </div>
            )}

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-black/60"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-black/60"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dots Navigation */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImage(i);
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === currentImage ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    )}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {property.is_featured && (
                <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-amber-500/25">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </span>
              )}
              <span className="rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                {property.property_type}
              </span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className={cn(
                'absolute right-3 top-3 rounded-full p-2 backdrop-blur-md transition-all duration-200',
                favorited
                  ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
              )}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
            </button>

            {/* Price Badge */}
            <div className="absolute bottom-3 right-3">
              <span className="inline-block rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-primary-600/25 backdrop-blur-sm">
                {formatCurrency(property.price)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white line-clamp-1 transition-colors group-hover:text-primary-400">
              {property.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-1 text-sm text-white/50">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {property.locality}, {property.city}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4" />
                {property.area} sqft
              </span>
              {property.parking > 0 && (
                <span className="flex items-center gap-1.5">
                  <Car className="h-4 w-4" />
                  {property.parking}
                </span>
              )}
            </div>

            {/* Furnished Indicator */}
            {property.furnished && (
              <div className="mt-2.5">
                <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Furnished
                </span>
              </div>
            )}

            {/* View Details Button */}
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <span className="text-sm font-medium text-primary-400 transition-colors group-hover:text-primary-300">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
