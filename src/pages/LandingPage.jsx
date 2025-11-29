import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import BookStat from '../components/BookStat'
import RecommendedBook from '../components/RecommendedBook'
import AboutUs from '../components/AboutUs'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const LandingPage = ({ onOpenAuth, onOpenDashboard, onNavigateToBooks, onStartReading, isLoggedIn, userName }) => {
  return (
    <div className="min-h-screen">
      <Navbar 
        onOpenAuth={onOpenAuth}
        onOpenDashboard={onOpenDashboard}
        onNavigateToBooks={onNavigateToBooks}
        isLoggedIn={isLoggedIn}
        userName={userName}
      />
      <Hero onNavigateToBooks={onNavigateToBooks} />
      <BookStat />
      <RecommendedBook onNavigateToBooks={onNavigateToBooks} onStartReading={onStartReading} />
      <AboutUs />
      <FAQ />
      <Footer />
    </div>
  )
}

export default LandingPage

