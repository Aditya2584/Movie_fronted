import React from 'react';

const GenreTabs = ({ activeTab, onTabChange, genres = [] }) => {
  const defaultGenres = ['All', 'Action', 'Comedy', 'Sci-Fi', 'Romance', 'Adventure', 'Animation', 'Thriller', 'Horror'];
  const tabs = genres.length > 0 ? genres : defaultGenres;

  return (
    <div className="relative">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-300 cursor-pointer ${
              activeTab === tab
                ? 'text-white bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/25'
                : 'text-[#A8A8A8] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreTabs;
