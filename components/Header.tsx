import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[#333] bg-[#1e1e1e] text-white">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4">
        <button
          type="button"
          className="flex items-center gap-1 transition-opacity hover:opacity-80"
          onClick={() => navigate('/')}
        >
          <span className="text-lg font-bold tracking-tight">
            Style<span className="text-[#7c3aed]">Sync</span>
          </span>
        </button>
        <nav className="text-sm font-medium text-[#b3b3b3]">AI 헤어 컨설턴트</nav>
      </div>
    </header>
  );
};

export default Header;
