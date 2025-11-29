import { useState } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import BookDetailOverlay from './BookDetailOverlay';
import SearchBox from './SearchBox';

const PopularBooks = ({ onStartReading }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [bookmarked, setBookmarked] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);

  // Data buku populer
  const books = [
    {
      id: 1,
      title: 'Biologi Molekuler',
      author: 'Dr. Ahmad Santoso',
      category: 'Biologi',
      description: 'Panduan lengkap memahami biologi molekuler dan genetika.',
      cover: 'bg-gradient-to-br from-green-400 to-green-600',
      pages: 350,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Fisika Kuantum Modern',
      author: 'Prof. Siti Rahayu',
      category: 'Fisika',
      description: 'Eksplorasi mendalam tentang fisika kuantum dan aplikasinya.',
      cover: 'bg-gradient-to-br from-blue-400 to-blue-600',
      pages: 420,
      rating: 4.9
    },
    {
      id: 3,
      title: 'Kimia Organik Dasar',
      author: 'Dr. Budi Wijaya',
      category: 'Kimia',
      description: 'Pengantar kimia organik dengan studi kasus praktis.',
      cover: 'bg-gradient-to-br from-purple-400 to-purple-600',
      pages: 380,
      rating: 4.7
    },
    {
      id: 4,
      title: 'Algoritma & Struktur Data',
      author: 'Ir. Dewi Lestari',
      category: 'Informatika',
      description: 'Fondasi algoritma dan struktur data untuk programmer.',
      cover: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      pages: 300,
      rating: 4.6
    },
    {
      id: 5,
      title: 'Manajemen Basis Data',
      author: 'M. Andi Pratama',
      category: 'Sistem Informasi',
      description: 'Desain dan implementasi sistem basis data modern.',
      cover: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      pages: 280,
      rating: 4.9
    },
    {
      id: 6,
      title: 'Geologi Pertambangan',
      author: 'Dr. Rudi Hartono',
      category: 'Pertambangan',
      description: 'Eksplorasi dan eksploitasi sumber daya mineral.',
      cover: 'bg-gradient-to-br from-amber-500 to-orange-600',
      pages: 390,
      rating: 4.8
    }
  ];

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' }
  ];

  return (
      <section className="py-12 md:py-16 bg-theme-primary">
      <div className="container-custom">
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-theme-primary">Popular Books</h2>
            <div className="hidden md:block">
              <SearchBox compact={true} />
            </div>
          </div>
          
          {/* Mobile Search Box */}
          <div className="mb-4 md:hidden">
            <SearchBox compact={true} />
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 border-b border-theme">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {books.map((book) => (
            <div 
              key={book.id} 
              className="cursor-pointer group"
              onClick={() => setSelectedBook(book)}
            >
              {/* Book Cover */}
              <div className={`${book.cover} rounded-lg h-72 mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 relative`}>
                <div className="text-white text-center">
                  <div className="text-4xl font-bold mb-2">{book.title.charAt(0)}</div>
                  <div className="text-sm opacity-90">{book.category}</div>
                </div>
              </div>

              {/* Book Info Container with Fixed Heights */}
              <div className="flex flex-col">
                {/* Title and Bookmark Container */}
                <div className="flex items-start justify-between mb-1.5">
                  {/* Title Container - Fixed Height */}
                  <div className="h-10 flex-1 pr-2">
                    <h3 className="font-bold text-theme-primary text-sm leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {book.title}
                    </h3>
                  </div>
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookmarked(prev => ({
                        ...prev,
                        [book.id]: !prev[book.id]
                      }));
                    }}
                    className="flex-shrink-0 p-1 hover:bg-theme-tertiary rounded transition-colors"
                    aria-label="Bookmark"
                  >
                    {bookmarked[book.id] ? (
                      <BsBookmarkFill className="w-4 h-4 text-primary-600" />
                    ) : (
                      <BsBookmark className="w-4 h-4 text-theme-tertiary hover:text-primary-600" />
                    )}
                  </button>
                </div>
                
                {/* Category Badge Container - Fixed Height */}
                <div className="h-6 mb-1.5">
                  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded truncate ${
                    book.category === 'Biologi' ? 'bg-green-100 text-green-700' :
                    book.category === 'Fisika' ? 'bg-blue-100 text-blue-700' :
                    book.category === 'Kimia' ? 'bg-purple-100 text-purple-700' :
                    book.category === 'Informatika' ? 'bg-cyan-100 text-cyan-700' :
                    book.category === 'Sistem Informasi' ? 'bg-indigo-100 text-indigo-700' :
                    book.category === 'Pertambangan' ? 'bg-orange-100 text-orange-700' :
                    book.category === 'Agribisnis' ? 'bg-lime-100 text-lime-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {book.category}
                  </span>
                </div>
                
                {/* Author Container - Fixed Height */}
                <div className="h-5 mb-1.5">
                  <p className="text-xs text-theme-secondary truncate">
                    {book.author}
                  </p>
                </div>
                
                {/* Rating Container - Fixed Height */}
                <div className="h-4 flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <svg 
                      key={index}
                      className={`w-3 h-3 ${index < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} 
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider Line - follows PopularBooks container width */}
      <div className="container-custom">
        <div className="border-t border-theme mt-8 mb-4"></div>
      </div>

      {/* Book Detail Overlay */}
      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          onStartReading={onStartReading}
        />
      )}
    </section>
  );
};

export default PopularBooks;

