import { useState } from 'react'
import subImage from '../assets/images/sub.jpg'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'Are all books really free?',
      answer: 'Yes! All books on MindPub are completely free and open source. There are no hidden costs, subscriptions, or premium features. Everything is available to everyone, forever.'
    },
    {
      question: 'Can I download books for offline reading?',
      answer: 'Yes, you can download books in various formats including PDF, EPUB, and MOBI. Simply click on the download button on any book page to get your preferred format.'
    },
    {
      question: 'How can I contribute a book?',
      answer: 'We welcome contributions! You can submit your book through our contribution form. All submissions are reviewed by our community to ensure quality and relevance. Make sure your book is open source and follows our guidelines.'
    },
    {
      question: 'What formats are supported?',
      answer: 'We support multiple reading formats including web-based reading, PDF, EPUB, and MOBI. You can read directly in your browser or download for offline reading on your preferred device.'
    },
    {
      question: 'Is there a mobile app?',
      answer: 'Currently, MindPub is a web-based platform that works perfectly on mobile browsers. We are working on native mobile apps for iOS and Android, which will be available soon.'
    },
    {
      question: 'How often are new books added?',
      answer: 'New books are added regularly as they are submitted and approved by our community. We typically add several new books each week across various categories.'
    }
  ]

  return (
    <section id="faq" className="bg-theme-secondary section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={subImage} 
                alt="FAQ" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Side - FAQ */}
          <div className="order-1 lg:order-2">
            <div className="mb-8">
              <h2 className="mb-4 text-theme-primary">Frequently Asked Questions</h2>
              <p className="text-lg text-theme-secondary">
                Got questions? We've got answers. If you can't find what you're looking for, 
                feel free to contact us.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-theme-card rounded-lg shadow-md overflow-hidden border border-theme"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-theme-tertiary transition-colors"
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  >
                    <span className="font-semibold text-theme-primary pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4">
                      <p className="text-theme-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ

