import subImage from '../assets/images/sub.jpg'

const Hero = ({ onNavigateToBooks }) => {
  return (
    <section id="home" className="bg-theme-secondary section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="mb-6 text-gradient">
              MindPub - Open Source Books Platform
            </h1>
            <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed">
              Your gateway to limitless knowledge. Access thousands of free academic books, 
              from Biology to Computer Science. Read anywhere, learn everything, grow together.
            </p>
            <div className="flex justify-center lg:justify-start">
              <button 
                onClick={onNavigateToBooks}
                className="btn-primary text-lg px-8 py-4"
              >
                Browse Book
              </button>
            </div>
          </div>
          
          {/* Right Side - Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={subImage} 
                alt="Open Source Books" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

