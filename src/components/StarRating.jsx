import { useEffect, useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, editable = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    // Ensure rating is converted to number
    setCurrentRating(Number(rating) || 0);
  }, [rating]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (value) => {
    if (editable && onRatingChange) {
      setCurrentRating(value);
      onRatingChange(value);
    }
  };

  const handleStarHover = (value) => {
    if (editable) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  // Ensure rating is always a number
  const displayRating = Number(hoverRating || currentRating || 0);

  const getStarFill = (index) => {
    const starValue = index + 1;
    const halfStarValue = index + 0.5;
    
    if (displayRating >= starValue) {
      return 'full';
    } else if (displayRating >= halfStarValue) {
      return 'half';
    }
    return 'empty';
  };

  return (
    <div 
      className={`flex items-center space-x-1 ${editable ? 'cursor-pointer' : ''}`}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(5)].map((_, index) => {
        const fill = getStarFill(index);
        const starValue = index + 1;
        const halfStarValue = index + 0.5;
        
        return (
          <div
            key={index}
            className="relative"
          >
            {/* Full star click area */}
            <div
              className="absolute inset-0 z-10"
              onClick={() => editable && handleStarClick(starValue)}
              onMouseEnter={() => editable && handleStarHover(starValue)}
            />
            
            {/* Half star click area (left half) */}
            {editable && (
              <div
                className="absolute left-0 top-0 bottom-0 w-1/2 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarClick(halfStarValue);
                }}
                onMouseEnter={() => handleStarHover(halfStarValue)}
              />
            )}
            
            <svg
              className={`${sizeClasses[size]} ${
                fill === 'full'
                  ? 'text-yellow-400 fill-current'
                  : fill === 'half'
                  ? 'text-yellow-400'
                  : 'text-gray-300 fill-current'
              } transition-colors ${editable ? 'hover:text-yellow-500' : ''} pointer-events-none`}
              viewBox="0 0 20 20"
            >
              <defs>
                <linearGradient id={`half-fill-${index}-${displayRating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>
              {fill === 'half' ? (
                <path
                  d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                  fill={`url(#half-fill-${index}-${displayRating})`}
                />
              ) : (
                <path
                  d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                  fill="currentColor"
                />
              )}
            </svg>
          </div>
        );
      })}
      {editable && (
        <span className="text-sm text-theme-secondary ml-2">
          {displayRating > 0 ? displayRating.toFixed(1) : '0.0'} / 5.0
        </span>
      )}
    </div>
  );
};

export default StarRating;

