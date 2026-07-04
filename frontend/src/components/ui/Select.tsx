import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Search } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multi?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  multi = false,
  searchable = true,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValues = multi ? (value as (string | number)[]) : value ? [value] : [];

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const getLabel = (val: string | number) =>
    options.find((opt) => opt.value === val)?.label || String(val);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optValue: string | number) => {
    if (multi) {
      const current = selectedValues as (string | number)[];
      const newValue = current.includes(optValue)
        ? current.filter((v) => v !== optValue)
        : [...current, optValue];
      onChange?.(newValue);
    } else {
      onChange?.(optValue);
      setIsOpen(false);
      setSearch('');
    }
  };

  const removeTag = (val: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(selectedValues.filter((v) => v !== val));
  };

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <motion.div
          whileTap={{ scale: 0.995 }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            flex items-center flex-wrap gap-1.5 min-h-[42px] w-full
            bg-white/5 backdrop-blur-sm border rounded-xl px-3 py-2
            cursor-pointer transition-all duration-200
            ${isOpen ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-white/10'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'}
            ${error ? 'border-red-500/50' : ''}
          `}
        >
          {selectedValues.length === 0 && !search && (
            <span className="text-white/30 text-sm">{placeholder}</span>
          )}
          {multi &&
            selectedValues.map((val) => (
              <span
                key={String(val)}
                className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-lg"
              >
                {getLabel(val)}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={(e) => removeTag(val, e)}
                />
              </span>
            ))}
          {!multi && selectedValues.length > 0 && (
            <span className="text-white text-sm">{getLabel(selectedValues[0])}</span>
          )}
          {searchable && isOpen && (
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none min-w-[60px]"
              placeholder={multi ? 'Search...' : ''}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </motion.div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden max-h-60 overflow-y-auto"
            >
              {searchable && !multi && (
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                  <Search className="w-4 h-4 text-white/40" />
                  <input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm outline-none"
                    placeholder="Search..."
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-white/30 text-sm">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={String(opt.value)}
                      onClick={() => handleSelect(opt.value)}
                      className={`
                        flex items-center justify-between px-3 py-2.5 cursor-pointer
                        transition-colors duration-100 text-sm
                        ${isSelected ? 'bg-blue-500/20 text-blue-300' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
