import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Calendar,
  Ruler,
  TrendingUp,
  Shield,
  Star,
  Building2,
  Heart,
  Share2,
  Printer,
  Phone,
  Train,
  Hospital,
  ChevronRight,
} from 'lucide-react';
import { useProperty, useProperties } from '@/hooks/useProperties';
import { formatCurrency, formatPricePerSqft, cn } from '@/lib/utils';
import ImageGallery from '@/components/properties/ImageGallery';
import SimilarProperties from '@/components/properties/SimilarProperties';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getInvestmentScore(p: {
  rental_yield: number;
  market_growth: number;
  crime_rate: number;
  property_age: number;
}): number {
  const yieldScore = Math.min(p.rental_yield * 5, 30);
  const growthScore = Math.min(p.market_growth * 3, 30);
  const crimeScore = p.crime_rate < 2 ? 20 : p.crime_rate < 5 ? 10 : 0;
  const ageScore = p.property_age < 5 ? 20 : p.property_age < 15 ? 10 : 0;
  return Math.round(yieldScore + growthScore + crimeScore + ageScore);
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-rose-400';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Below Average';
}

function getCrimeLabel(rate: number): { label: string; color: string } {
  if (rate < 2) return { label: 'Very Low', color: 'bg-emerald-500/20 text-emerald-400' };
  if (rate < 5) return { label: 'Low', color: 'bg-emerald-500/10 text-emerald-400' };
  if (rate < 10) return { label: 'Moderate', color: 'bg-amber-500/10 text-amber-400' };
  return { label: 'High', color: 'bg-rose-500/10 text-rose-400' };
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id ?? '');
  const [favorited, setFavorited] = useState(false);

  const { data: similarData } = useProperties({
    city: property?.city,
    min_price: property ? Math.round(property.price * 0.7) : undefined,
    max_price: property ? Math.round(property.price * 1.3) : undefined,
    per_page: 8,
  });

  const similarProperties = (similarData?.items ?? []).filter(
    (p) => p.id !== property?.id
  );

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [property?.title]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-6 space-y-4">
            <div className="h-96 animate-pulse rounded-3xl bg-white/5" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-white/10" />
          <h2 className="mt-4 text-xl font-bold text-white">Property Not Found</h2>
          <p className="mt-2 text-sm text-white/40">
            The property you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const investmentScore = getInvestmentScore(property);
  const crimeInfo = getCrimeLabel(property.crime_rate);

  const keyStats = [
    { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms, color: 'text-primary-400 bg-primary-500/10' },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms, color: 'text-cyan-400 bg-cyan-500/10' },
    { icon: Ruler, label: 'Area', value: `${property.area} sqft`, color: 'text-amber-400 bg-amber-500/10' },
    { icon: Car, label: 'Parking', value: `${property.parking} spots`, color: 'text-orange-400 bg-orange-500/10' },
    { icon: Calendar, label: 'Year Built', value: property.year_built, color: 'text-teal-400 bg-teal-500/10' },
    { icon: Calendar, label: 'Property Age', value: `${property.property_age} yrs`, color: 'text-rose-400 bg-rose-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          {/* Breadcrumb */}
          <motion.div variants={fadeInUp} className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-white/40">
              <Link to="/properties" className="transition-colors hover:text-white">
                Properties
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white/60">{property.city}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white/60">{property.locality}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate text-white/80">{property.title}</span>
            </nav>
          </motion.div>

          {/* Image Gallery */}
          <motion.div variants={fadeInUp}>
            <ImageGallery images={property.images} title={property.title} />
          </motion.div>

          {/* Content Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Price */}
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {property.is_featured && (
                        <span className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                      <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
                        {property.property_type}
                      </span>
                    </div>
                    <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                      {property.title}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-white/50">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {property.address}, {property.locality}, {property.city}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{formatCurrency(property.price)}</p>
                    <p className="mt-1 text-sm text-white/40">{formatPricePerSqft(property.price, property.area)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
                  <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40">
                    <Phone className="h-4 w-4" />
                    Contact Owner
                  </button>
                  <button
                    onClick={() => setFavorited(!favorited)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                      favorited
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
                    {favorited ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </motion.div>

              {/* Key Stats */}
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <h2 className="mb-4 text-lg font-semibold text-white">Key Details</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {keyStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5"
                    >
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{stat.value}</p>
                        <p className="text-xs text-white/40">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              {property.description && (
                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
                >
                  <h2 className="mb-3 text-lg font-semibold text-white">Description</h2>
                  <p className="text-sm leading-relaxed text-white/60">{property.description}</p>
                </motion.div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
                >
                  <h2 className="mb-3 text-lg font-semibold text-white">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Location / Map */}
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <h2 className="mb-4 text-lg font-semibold text-white">Location</h2>
                <div className="mb-4 h-64 overflow-hidden rounded-xl bg-white/5">
                  {typeof window !== 'undefined' && (
                    <div id="property-map" className="h-full w-full relative">
                      <link
                        rel="stylesheet"
                        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                      />
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <MapPin className="mx-auto h-10 w-10 text-primary-400/50" />
                          <p className="mt-2 text-sm text-white/40">{property.address}</p>
                          <p className="mt-1 text-xs text-white/30">
                            {property.latitude}, {property.longitude}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                      <Hospital className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{property.hospital_distance} km</p>
                      <p className="text-xs text-white/40">Nearest Hospital</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                      <Train className="h-5 w-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{property.metro_distance} km</p>
                      <p className="text-xs text-white/40">Nearest Metro</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3.5">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', crimeInfo.color.split(' ')[1])}>
                      <Shield className={cn('h-5 w-5', crimeInfo.color.split(' ')[0])} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{property.crime_rate}</p>
                      <p className="text-xs text-white/40">
                        Crime Rate ·{' '}
                        <span className={crimeInfo.color.split(' ')[0]}>{crimeInfo.label}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Nearby Schools */}
              {property.nearby_schools?.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
                >
                  <h2 className="mb-3 text-lg font-semibold text-white">Nearby Schools</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.nearby_schools.map((school) => (
                      <span
                        key={school}
                        className="rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-400"
                      >
                        {school}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Similar Properties */}
              {similarProperties.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <SimilarProperties properties={similarProperties} />
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Financial Insights */}
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <h2 className="mb-4 text-lg font-semibold text-white">Financial Insights</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Rental Yield</p>
                        <p className="text-sm font-semibold text-white">{property.rental_yield}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                        <TrendingUp className="h-5 w-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Market Growth</p>
                        <p className="text-sm font-semibold text-white">{property.market_growth}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-xs text-white/40">Investment Score</p>
                    <p className={cn('mt-1 text-3xl font-bold', getScoreColor(investmentScore))}>
                      {investmentScore}
                    </p>
                    <p className={cn('mt-0.5 text-xs font-medium', getScoreColor(investmentScore))}>
                      {getScoreLabel(investmentScore)}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${investmentScore}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          investmentScore >= 70
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : investmentScore >= 40
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Population */}
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <h2 className="mb-3 text-lg font-semibold text-white">Area Insights</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                    <span className="text-sm text-white/50">Population</span>
                    <span className="text-sm font-semibold text-white">
                      {property.population?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                    <span className="text-sm text-white/50">Price per sqft</span>
                    <span className="text-sm font-semibold text-white">
                      {formatPricePerSqft(property.price, property.area)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                    <span className="text-sm text-white/50">Total Cost</span>
                    <span className="text-sm font-bold text-primary-400">
                      {formatCurrency(property.price)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
