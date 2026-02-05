import React from 'react';
import { Scissors } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <Scissors className="w-6 h-6 rotate-[-90deg]" />
          <h1 className="text-xl font-bold tracking-tight">StyleSync AI</h1>
        </div>
        <nav className="text-sm font-medium text-gray-500">
          AI 가상 헤어 컨설턴트
        </nav>
      </div>
    </header>
  );
};

export default Header;