import { useMemo, useState } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import BookDetailOverlay from './BookDetailOverlay';

const AllBooks = ({ filters, onStartReading }) => {
  const [bookmarked, setBookmarked] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const booksPerPage = 20;

  // Data 20 buku untuk grid 4x5
  const allBooks = [
    { id: 1, title: 'Biologi Molekuler', author: 'Dr. Ahmad Santoso', category: 'Biologi', cover: 'bg-gradient-to-br from-green-400 to-green-600', rating: 4.8, pages: 350, releaseDate: '2023', description: 'Panduan lengkap memahami biologi molekuler dan genetika modern.' },
    { id: 2, title: 'Fisika Kuantum Modern', author: 'Prof. Siti Rahayu', category: 'Fisika', cover: 'bg-gradient-to-br from-blue-400 to-blue-600', rating: 4.9, pages: 420, releaseDate: '2024', description: 'Eksplorasi mendalam tentang fisika kuantum dan aplikasinya.' },
    { id: 3, title: 'Kimia Organik Dasar', author: 'Dr. Budi Wijaya', category: 'Kimia', cover: 'bg-gradient-to-br from-purple-400 to-purple-600', rating: 4.7, pages: 380, releaseDate: '2023', description: 'Pengantar kimia organik dengan studi kasus praktis.' },
    { id: 4, title: 'Algoritma & Struktur Data', author: 'Ir. Dewi Lestari', category: 'Informatika', cover: 'bg-gradient-to-br from-cyan-400 to-cyan-600', rating: 4.6, pages: 300, releaseDate: '2024', description: 'Fondasi algoritma dan struktur data untuk programmer.' },
    { id: 5, title: 'Manajemen Basis Data', author: 'M. Andi Pratama', category: 'Sistem Informasi', cover: 'bg-gradient-to-br from-indigo-400 to-indigo-600', rating: 4.9, pages: 280, releaseDate: '2023', description: 'Desain dan implementasi sistem basis data modern.' },
    { id: 6, title: 'Geologi Pertambangan', author: 'Dr. Rudi Hartono', category: 'Pertambangan', cover: 'bg-gradient-to-br from-amber-500 to-orange-600', rating: 4.8 },
    { id: 7, title: 'Agribisnis Modern', author: 'Ir. Yuni Safitri', category: 'Agribisnis', cover: 'bg-gradient-to-br from-lime-400 to-green-600', rating: 4.7 },
    { id: 8, title: 'Teori Relativitas Einstein', author: 'Prof. Dr. Bambang', category: 'Fisika', cover: 'bg-gradient-to-br from-slate-400 to-slate-600', rating: 4.9 },
    { id: 9, title: 'Mikrobiologi Terapan', author: 'Dr. Sinta Dewi', category: 'Biologi', cover: 'bg-gradient-to-br from-emerald-400 to-emerald-600', rating: 4.5 },
    { id: 10, title: 'Kalkulus Lanjutan', author: 'Prof. Hendra M.', category: 'Fisika', cover: 'bg-gradient-to-br from-sky-400 to-sky-600', rating: 4.6 },
    { id: 11, title: 'Kimia Anorganik', author: 'Dr. Lisa Permata', category: 'Kimia', cover: 'bg-gradient-to-br from-violet-400 to-violet-600', rating: 4.8 },
    { id: 12, title: 'Pemrograman Web', author: 'Andi Wijaya S.Kom', category: 'Informatika', cover: 'bg-gradient-to-br from-teal-400 to-teal-600', rating: 4.7 },
    { id: 13, title: 'Data Mining', author: 'Dr. Rahmat Hidayat', category: 'Sistem Informasi', cover: 'bg-gradient-to-br from-purple-500 to-purple-700', rating: 4.9 },
    { id: 14, title: 'Metalurgi Ekstraktif', author: 'Ir. Budi Santoso', category: 'Pertambangan', cover: 'bg-gradient-to-br from-orange-400 to-orange-600', rating: 4.6 },
    { id: 15, title: 'Teknologi Pasca Panen', author: 'Prof. Siti Aminah', category: 'Agribisnis', cover: 'bg-gradient-to-br from-green-500 to-green-700', rating: 4.8 },
    { id: 16, title: 'Genetika Molekuler', author: 'Dr. Rina Kusuma', category: 'Biologi', cover: 'bg-gradient-to-br from-green-300 to-green-500', rating: 4.7 },
    { id: 17, title: 'Mekanika Kuantum', author: 'Prof. Joko Susilo', category: 'Fisika', cover: 'bg-gradient-to-br from-blue-500 to-blue-700', rating: 4.9 },
    { id: 18, title: 'Kimia Fisika', author: 'Dr. Dian Purnama', category: 'Kimia', cover: 'bg-gradient-to-br from-pink-400 to-pink-600', rating: 4.5 },
    { id: 19, title: 'Machine Learning', author: 'Ir. Tommy Chen', category: 'Informatika', cover: 'bg-gradient-to-br from-cyan-500 to-cyan-700', rating: 4.9 },
    { id: 20, title: 'Cloud Computing', author: 'M. Rizki Pratama', category: 'Sistem Informasi', cover: 'bg-gradient-to-br from-indigo-500 to-indigo-700', rating: 4.8 },
    { id: 21, title: 'Jaringan Komputer', author: 'Dr. Andi Wijaya', category: 'Informatika', cover: 'bg-gradient-to-br from-teal-500 to-teal-700', rating: 4.7 },
    { id: 22, title: 'Ekologi Laut', author: 'Prof. Marina Sari', category: 'Biologi', cover: 'bg-gradient-to-br from-blue-300 to-blue-500', rating: 4.6 },
    { id: 23, title: 'Astronomi Dasar', author: 'Dr. Bintang Utama', category: 'Fisika', cover: 'bg-gradient-to-br from-indigo-300 to-indigo-500', rating: 4.8 },
    { id: 24, title: 'Biokimia Terapan', author: 'Dr. Sinta Purnama', category: 'Kimia', cover: 'bg-gradient-to-br from-rose-400 to-rose-600', rating: 4.5 },
    { id: 25, title: 'Big Data Analytics', author: 'Ir. Data Scientist', category: 'Sistem Informasi', cover: 'bg-gradient-to-br from-purple-600 to-purple-800', rating: 4.9 }
  ];

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...allBooks];

    // Filter by category
    if (filters.category !== 'all') {
      const categoryMap = {
        'biologi': 'Biologi',
        'fisika': 'Fisika',
        'kimia': 'Kimia',
        'informatika': 'Informatika',
        'sistem-informasi': 'Sistem Informasi',
        'pertambangan': 'Pertambangan',
        'agribisnis': 'Agribisnis'
      };
      const selectedCategory = categoryMap[filters.category];
      result = result.filter(book => book.category === selectedCategory);
    }

    // Sort books
    switch (filters.sort) {
      case 'popular':
        // Keep default order (already popular)
        break;
      case 'newest':
        result = result.reverse();
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Our Books Collection</h2>
          <p className="text-theme-secondary text-sm mt-1">
            See our Books Collection Freely
          </p>
        </div>

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-theme-tertiary text-theme-tertiary cursor-not-allowed opacity-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <IoChevronBackOutline className="w-5 h-5" />
            </button>

            <span className="text-sm font-semibold text-theme-primary">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-theme-tertiary text-theme-tertiary cursor-not-allowed opacity-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <IoChevronForwardOutline className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Books Grid 4x5 */}
      {currentBooks.length > 0 ? (
        <div className="grid grid-cols-4 gap-6">
          {currentBooks.map((book) => (
          <div 
            key={book.id} 
            className="cursor-pointer group"
            onClick={() => setSelectedBook(book)}
          >
            {/* Book Cover */}
            <div className={`${book.cover} rounded-lg h-64 mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
              <div className="text-white text-center">
                <div className="text-3xl font-bold mb-2">{book.title.charAt(0)}</div>
                <div className="text-xs opacity-90">{book.category}</div>
              </div>
            </div>

            {/* Book Info */}
            <div className="flex flex-col">
              {/* Title and Bookmark */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="h-10 flex-1 pr-2">
                  <h3 className="font-bold text-theme-primary text-sm leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {book.title}
                  </h3>
                </div>
                
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
              
              {/* Category Badge */}
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
              
              {/* Author */}
              <div className="h-5 mb-1.5">
                <p className="text-xs text-theme-secondary truncate">
                  {book.author}
                </p>
              </div>
              
              {/* Rating */}
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
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No books found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Book Detail Overlay */}
      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          onStartReading={onStartReading}
        />
      )}
    </div>
  );
};

export default AllBooks;

