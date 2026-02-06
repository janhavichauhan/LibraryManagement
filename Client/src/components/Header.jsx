import React, { useState } from 'react';

const Header = () => {
  const [search, setSearch] = useState('');
  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BookBase</h1>
        </div>
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search your favourite books"
            className="w-full p-3 rounded-xl glass text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Bob</span>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
      </div>
    </header>
  );
};

export default Header;
