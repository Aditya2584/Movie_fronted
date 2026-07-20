import React from 'react';
import { Search, ChevronDown, Globe } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'RELEASED', label: 'Released' },
  { value: 'COMING_SOON', label: 'Coming Soon' },
];

const SearchFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  langFilter,
  onLangChange,
  languages = [],
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border glass p-6 md:p-8">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <p className="type-overline">Discover</p>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted transition-colors duration-200 group-focus-within:text-text-primary">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="movie-search"
              type="text"
              placeholder="Search movies, directors..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-search w-full py-3.5 pl-11 pr-4 text-base md:text-sm
                bg-bg-secondary/60 border-border/80 backdrop-blur-sm
                focus:bg-bg-secondary focus:border-border-focus
                transition-all duration-300 ease-out"
            />
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          {/* Status chips */}
          <div className="space-y-2.5 min-w-0 flex-1">
            <p className="type-caption">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => {
                const isActive = statusFilter === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => onStatusChange(status.value)}
                    className={`
                      relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium
                      transition-all duration-300 ease-out cursor-pointer whitespace-nowrap
                      ${isActive
                        ? 'bg-text-primary text-text-inverse shadow-sm scale-[1.02]'
                        : 'bg-bg-secondary/70 text-text-secondary border border-border hover:text-text-primary hover:border-border-hover hover:bg-bg-hover'
                      }
                    `}
                  >
                    <span className="relative z-10">{status.label}</span>
                    {isActive && (
                      <span
                        className="absolute inset-0 bg-white/10 animate-fadeIn"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language dropdown */}
          <div className="space-y-2.5 w-full lg:w-[220px] shrink-0">
            <p className="type-caption">Language</p>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted pointer-events-none transition-colors duration-200 group-focus-within:text-text-primary">
                <Globe className="w-4 h-4" />
              </span>
              <select
                value={langFilter}
                onChange={(e) => onLangChange(e.target.value)}
                className="select w-full py-3 pl-10 pr-10 text-sm
                  bg-bg-secondary/60 border-border/80 backdrop-blur-sm
                  focus:bg-bg-secondary focus:border-border-focus
                  transition-all duration-300 ease-out cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-bg-card text-text-primary">
                    {lang === 'ALL' ? 'All Languages' : lang}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none transition-transform duration-200 group-focus-within:rotate-180"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
