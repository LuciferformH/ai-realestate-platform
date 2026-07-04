import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X, Plus } from 'lucide-react';
import { CITIES, PROPERTY_TYPES, AMENITIES_LIST } from '@/lib/constants';
import type { Property } from '@/types';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onSave: (data: Partial<Property>) => void;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  property_type: string;
  price: number;
  city: string;
  locality: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furnished: boolean;
  area: number;
  year_built: number;
  description: string;
  images: string[];
  amenities: string[];
  is_featured: boolean;
  is_active: boolean;
}

const defaultFormData: FormData = {
  title: '',
  property_type: 'apartment',
  price: 0,
  city: '',
  locality: '',
  address: '',
  bedrooms: 2,
  bathrooms: 2,
  parking: 1,
  furnished: false,
  area: 0,
  year_built: new Date().getFullYear(),
  description: '',
  images: [],
  amenities: [],
  is_featured: false,
  is_active: true,
};

const CITY_OPTIONS = CITIES.map((c) => ({ value: c.name, label: c.name }));
const TYPE_OPTIONS = PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }));
const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  property,
  onSave,
  isLoading = false,
}) => {
  const [form, setForm] = useState<FormData>(defaultFormData);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title,
        property_type: property.property_type,
        price: property.price,
        city: property.city,
        locality: property.locality,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking: property.parking,
        furnished: property.furnished,
        area: property.area,
        year_built: property.year_built,
        description: property.description,
        images: property.images || [],
        amenities: property.amenities || [],
        is_featured: property.is_featured,
        is_active: property.is_active,
      });
    } else {
      setForm(defaultFormData);
    }
    setErrors({});
    setNewImageUrl('');
  }, [property, isOpen]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (url && !form.images.includes(url)) {
      updateField('images', [...form.images, url]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (url: string) => {
    updateField('images', form.images.filter((i) => i !== url));
  };

  const toggleAmenity = (amenity: string) => {
    if (form.amenities.includes(amenity)) {
      updateField('amenities', form.amenities.filter((a) => a !== amenity));
    } else {
      updateField('amenities', [...form.amenities, amenity]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.city) newErrors.city = 'City is required';
    if (form.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.area <= 0) newErrors.area = 'Area must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...form,
        latitude: CITIES.find((c) => c.name === form.city)?.latitude || 0,
        longitude: CITIES.find((c) => c.name === form.city)?.longitude || 0,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? 'Edit Property' : 'Add New Property'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Property Title"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                error={errors.title}
                placeholder="e.g. Luxury Apartment in Mumbai"
              />
            </div>
            <Select
              label="Property Type"
              options={TYPE_OPTIONS}
              value={form.property_type}
              onChange={(val) => updateField('property_type', val as string)}
            />
            <Select
              label="City"
              options={CITY_OPTIONS}
              value={form.city}
              onChange={(val) => updateField('city', val as string)}
              error={errors.city}
              placeholder="Select city"
            />
            <Input
              label="Locality"
              value={form.locality}
              onChange={(e) => updateField('locality', e.target.value)}
              placeholder="e.g. Bandra West"
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Full address"
            />
          </div>
        </div>

        {/* Pricing & Size */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Pricing & Size</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (INR)"
              type="number"
              value={form.price || ''}
              onChange={(e) => updateField('price', Number(e.target.value))}
              error={errors.price}
              placeholder="0"
            />
            <Input
              label="Area (sq ft)"
              type="number"
              value={form.area || ''}
              onChange={(e) => updateField('area', Number(e.target.value))}
              error={errors.area}
              placeholder="0"
            />
            <Input
              label="Year Built"
              type="number"
              value={form.year_built || ''}
              onChange={(e) => updateField('year_built', Number(e.target.value))}
              placeholder="2024"
            />
          </div>
        </div>

        {/* Rooms */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Rooms & Parking</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              value={form.bedrooms}
              onChange={(val) => updateField('bedrooms', Number(val))}
            />
            <Input
              label="Bathrooms"
              type="number"
              value={form.bathrooms || ''}
              onChange={(e) => updateField('bathrooms', Number(e.target.value))}
            />
            <Input
              label="Parking Spots"
              type="number"
              value={form.parking || ''}
              onChange={(e) => updateField('parking', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Description</h4>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            placeholder="Property description..."
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 resize-none"
          />
        </div>

        {/* Images */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Images</h4>
          <div className="flex gap-2 mb-3">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addImageUrl} icon={<Plus className="w-4 h-4" />}>
              Add
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60"
                >
                  <span className="truncate max-w-[150px]">{url.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => removeImageUrl(url)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Amenities */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map((amenity) => {
              const isSelected = form.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
                    }
                  `}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Featured</p>
              <p className="text-xs text-white/40">Show in featured listings</p>
            </div>
            <button
              type="button"
              onClick={() => updateField('is_featured', !form.is_featured)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${form.is_featured ? 'bg-amber-500' : 'bg-white/10'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 rounded-full bg-white transition-transform
                  ${form.is_featured ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-white/40">Property is visible on platform</p>
            </div>
            <button
              type="button"
              onClick={() => updateField('is_active', !form.is_active)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${form.is_active ? 'bg-emerald-500' : 'bg-white/10'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 rounded-full bg-white transition-transform
                  ${form.is_active ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {property ? 'Save Changes' : 'Add Property'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PropertyFormModal;
