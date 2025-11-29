const ReadingTime = ({ readingTime }) => {
  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-theme-primary mb-4">Reading Time</h3>
      <div className="text-center">
        <div className="text-5xl font-bold text-primary-600 mb-4 font-mono">
          {formatTime(readingTime)}
        </div>
        <p className="text-xs text-theme-tertiary">
          Total time spent reading this book
        </p>
      </div>
    </div>
  );
};

export default ReadingTime;

