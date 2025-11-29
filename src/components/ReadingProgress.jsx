import { IoBookmarkOutline } from 'react-icons/io5';

const ReadingProgress = ({ currentPage, furthestPage, totalPages }) => {
  // Progress is based on furthest page, not current page
  const progressPercentage = Math.round((furthestPage / totalPages) * 100);
  const pagesLeft = totalPages - furthestPage;

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center">
        <IoBookmarkOutline className="w-5 h-5 mr-2" />
        Reading Progress
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-theme-secondary">Current Page</span>
            <span className="text-2xl font-bold text-primary-600">
              {currentPage} / {totalPages}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-theme-tertiary rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-theme-tertiary">0%</span>
            <span className="text-xs font-semibold text-theme-primary">
              {progressPercentage}%
            </span>
            <span className="text-xs text-theme-tertiary">100%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-theme">
          <div className="bg-theme-secondary p-3 rounded-lg">
            <p className="text-xs text-theme-tertiary mb-1">Pages Left</p>
            <p className="text-lg font-bold text-theme-primary">
              {pagesLeft}
            </p>
          </div>
          <div className="bg-theme-secondary p-3 rounded-lg">
            <p className="text-xs text-theme-tertiary mb-1">Completed</p>
            <p className="text-lg font-bold text-theme-primary">
              {progressPercentage}%
            </p>
          </div>
          <div className="bg-theme-secondary p-3 rounded-lg col-span-2">
            <p className="text-xs text-theme-tertiary mb-1">Furthest Read</p>
            <p className="text-lg font-bold text-primary-600">
              Page {furthestPage} / {totalPages}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgress;

