import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PopularBooks from '../components/PopularBooks';
import AllBooks from '../components/AllBooks';
import FilterBooks from '../components/FilterBooks';
import Leaderboard from '../components/Leaderboard';
import RecentReadBooks from '../components/RecentReadBooks';
import SubmitTicket from '../components/SubmitTicket';

const BooksPage = ({ onOpenAuth, onOpenDashboard, onNavigateToHome, onStartReading, isLoggedIn, userName }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'popular'
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-theme-primary">
      <Navbar 
        onOpenAuth={onOpenAuth}
        onOpenDashboard={onOpenDashboard}
        onNavigateToHome={onNavigateToHome}
        onNavigateToBooks={() => {}} // Already on books page
        isLoggedIn={isLoggedIn}
        userName={userName}
      />
      
      {/* Popular Books Section */}
      <PopularBooks onStartReading={onStartReading} />

      {/* Main Container with 3 Components */}
      <section className="py-8 md:py-12 bg-theme-primary">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mobile: Filter shows first, Desktop: Filter on right */}
            <div className="lg:order-2 lg:col-span-1 space-y-6">
              <FilterBooks onFilterChange={handleFilterChange} currentFilters={filters} />
              <Leaderboard onStartReading={onStartReading} />
              {isLoggedIn && (
                <>
                  <RecentReadBooks onStartReading={onStartReading} />
                  <SubmitTicket />
                </>
              )}
            </div>

            {/* Mobile: All Books shows second, Desktop: All Books on left */}
            <div className="lg:order-1 lg:col-span-2">
              <AllBooks filters={filters} onStartReading={onStartReading} />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BooksPage;

