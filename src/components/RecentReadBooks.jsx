import { useState } from 'react';
import BookDetailOverlay from './BookDetailOverlay';

const RecentReadBooks = ({ onStartReading }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const recentBooks = [
    {
      id: 1,
      title: 'Algoritma & Struktur Data',
      author: 'Ir. Dewi Lestari',
      category: 'Informatika',
      cover: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      progress: 75,
      lastRead: '2 jam yang lalu'
    },
    {
      id: 2,
      title: 'Fisika Kuantum Modern',
      author: 'Prof. Siti Rahayu',
      category: 'Fisika',
      cover: 'bg-gradient-to-br from-blue-400 to-blue-600',
      progress: 45,
      lastRead: '1 hari yang lalu'
    },
    {
      id: 3,
      title: 'Biologi Molekuler',
      author: 'Dr. Ahmad Santoso',
      category: 'Biologi',
      cover: 'bg-gradient-to-br from-green-400 to-green-600',
      progress: 90,
      lastRead: '2 hari yang lalu'
    },
    {
      id: 4,
      title: 'Manajemen Basis Data',
      author: 'M. Andi Pratama',
      category: 'Sistem Informasi',
      cover: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      progress: 30,
      lastRead: '3 hari yang lalu'
    },
    {
      id: 5,
      title: 'Kimia Organik Dasar',
      author: 'Dr. Budi Wijaya',
      category: 'Kimia',
      cover: 'bg-gradient-to-br from-purple-400 to-purple-600',
      progress: 60,
      lastRead: '4 hari yang lalu'
    },
    {
      id: 6,
      title: 'Geologi Pertambangan',
      author: 'Dr. Rudi Hartono',
      category: 'Pertambangan',
      cover: 'bg-gradient-to-br from-amber-500 to-orange-600',
      progress: 15,
      lastRead: '5 hari yang lalu'
    }
  ];

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-theme-primary">Recent Read</h3>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {recentBooks.map((book) => (
          <div
            key={book.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-theme-tertiary transition-colors cursor-pointer group"
            onClick={() => setSelectedBook(book)}
          >
            {/* Book Cover */}
            <div className={`w-10 h-14 ${book.cover} rounded flex-shrink-0 shadow-sm`}></div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-theme-primary text-xs line-clamp-1 group-hover:text-primary-600 transition-colors">
                {book.title}
              </h4>
              <p className="text-xs text-theme-secondary truncate">
                {book.author}
              </p>
              
              {/* Progress Bar */}
              <div className="mt-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-theme-tertiary">{book.lastRead}</span>
                  <span className="text-xs font-semibold text-primary-600">{book.progress}%</span>
                </div>
                <div className="w-full bg-theme-tertiary rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${book.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

export default RecentReadBooks;

