import { useState } from 'react'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import BookDetailOverlay from './BookDetailOverlay'

const RecommendedBook = ({ onNavigateToBooks, onStartReading }) => {
  const [bookmarked, setBookmarked] = useState({})
  const [selectedBook, setSelectedBook] = useState(null)
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
    },
    {
      id: 7,
      title: 'Agribisnis Modern',
      author: 'Ir. Yuni Safitri',
      category: 'Agribisnis',
      description: 'Manajemen dan strategi bisnis pertanian berkelanjutan.',
      cover: 'bg-gradient-to-br from-lime-400 to-green-600',
      pages: 340,
      rating: 4.7
    }
  ]

  return (
    <section id="books" className="bg-theme-primary py-12 md:py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="mb-2 text-theme-primary">Recommended Books</h2>
            <p className="text-theme-secondary">
              Discover our handpicked selection of the best open-source books
            </p>
          </div>
          <button
            onClick={onNavigateToBooks}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors cursor-pointer"
          >
            More book
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Horizontal Scrollable Container */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide hover:scrollbar-default">
            {books.map((book) => (
              <div 
                key={book.id} 
                className="flex-shrink-0 w-56 cursor-pointer group"
                onClick={() => setSelectedBook(book)}
              >
                {/* Book Cover */}
                <div className={`${book.cover} rounded-lg h-80 mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
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
                        e.stopPropagation()
                        setBookmarked(prev => ({
                          ...prev,
                          [book.id]: !prev[book.id]
                        }))
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
  )
}

export default RecommendedBook

