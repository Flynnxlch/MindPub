import { useState } from 'react';
import { IoSendOutline } from 'react-icons/io5';
import { ticketService } from '../services';

const SubmitTicket = () => {
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'technical',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  const handleChange = (e) => {
    setTicketData({
      ...ticketData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Please login to submit a ticket');
      return;
    }

    try {
      setLoading(true);
      await ticketService.createTicket(userId, ticketData);
      alert('Ticket submitted successfully!');
      setTicketData({
        subject: '',
        category: 'technical',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting ticket:', err);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-theme-primary">Submit Ticket</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-theme-primary mb-2">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={ticketData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-theme rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-theme-primary text-theme-primary"
            placeholder="Brief description of your issue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary mb-2">
            Category
          </label>
          <select
            name="category"
            value={ticketData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-theme rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-theme-primary text-theme-primary"
          >
            <option value="technical">Technical Issue</option>
            <option value="book">Book Related</option>
            <option value="account">Account Issue</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={ticketData.message}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-theme rounded-lg focus:outline-none focus:border-primary-500 text-sm resize-none bg-theme-primary text-theme-primary"
            placeholder="Describe your issue in detail..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userId}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoSendOutline className="w-5 h-5" />
          <span>{loading ? 'Submitting...' : 'Submit Ticket'}</span>
        </button>
      </form>
    </div>
  );
};

export default SubmitTicket;

