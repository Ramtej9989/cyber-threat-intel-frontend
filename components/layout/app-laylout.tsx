import React from 'react';

interface TopNavProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function TopNav({ collapsed, toggleSidebar }: TopNavProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {collapsed ? '☰' : '✕'}
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Cyber Threat Intel</h1>
        <div className="flex items-center space-x-4">
          {/* Add additional nav items here, e.g., user menu, notifications */}
        </div>
      </div>
    </header>
  );
}
