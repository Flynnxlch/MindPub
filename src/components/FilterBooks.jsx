const FilterBooks = ({ onFilterChange, currentFilters }) => {
  const selectedCategory = currentFilters.category;
  const selectedSort = currentFilters.sort;

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'biologi', label: 'Biologi' },
    { id: 'fisika', label: 'Fisika' },
    { id: 'kimia', label: 'Kimia' },
    { id: 'informatika', label: 'Informatika' },
    { id: 'sistem-informasi', label: 'Sistem Info' },
    { id: 'pertambangan', label: 'Pertambangan' },
    { id: 'agribisnis', label: 'Agribisnis' }
  ];

  const sortOptions = [
    { id: 'popular', label: 'Popular' },
    { id: 'newest', label: 'Newest' },
    { id: 'rating', label: 'Rating' },
    { id: 'title', label: 'A-Z' }
  ];

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-theme-primary mb-4">Filter Books</h3>
      
      {/* Category Filter - Pills */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-theme-secondary mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onFilterChange({ ...currentFilters, category: category.id })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-theme-tertiary text-theme-primary hover:opacity-80'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By - Pills */}
      <div>
        <h4 className="text-sm font-semibold text-theme-secondary mb-3">Sort By</h4>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange({ ...currentFilters, sort: option.id })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedSort === option.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-theme-tertiary text-theme-primary hover:opacity-80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBooks;

