import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#1e1e1e] text-white sticky top-0 z-50 border-b border-[#333]">
      <div className="max-w-5xl mx-auto px-4 h-[60px] flex items-center justify-between">
        <div
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <span className="font-bold text-lg tracking-tight">Style<span className="text-[#7c3aed]">Sync</span></span>
        </div>
        <nav className="text-sm font-medium text-[#b3b3b3]">
          AI 가상 헤어 컨설턴트
        </nav>
      </div>
    </header>
  );
};

export default Header;