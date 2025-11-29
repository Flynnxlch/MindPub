import { useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';

const SearchBox = ({ compact = false }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality here
  };

  // Compact version for header
  if (compact) {
    return (
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full max-w-xs px-4 py-2 pr-10 border border-theme rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm bg-theme-card text-theme-primary"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <IoSearchOutline className="w-4 h-4" />
          </button>
        </div>
      </form>
    );
  }

  // Full version (original)
  return (
    <section className="py-8 bg-theme-primary">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-theme-primary mb-4 text-center">
            Search Books
          </h2>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book title..."
                className="w-full px-6 py-4 pr-14 border-2 border-theme rounded-full focus:outline-none focus:border-primary-500 transition-colors shadow-sm text-base bg-theme-card text-theme-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
              >
                <IoSearchOutline className="w-5 h-5" />
              </button>
            </div>
          </form>
          <p className="text-theme-secondary text-sm mt-3 text-center">
            Search from thousands of books in our collection
          </p>
        </div>
      </div>
    </section>
  );
};

export default SearchBox;

