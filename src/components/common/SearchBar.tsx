import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  showClear?: boolean;
}

const SearchBar = ({ placeholder = 'Buscar...', value, onChange, className = '', showClear = true }: SearchBarProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-blue-50 p-2 text-blue-500 shadow-sm">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-transparent bg-white/80 pl-12 pr-12 py-3 text-sm font-medium text-slate-600 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
      />
      {showClear && value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
          title="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

