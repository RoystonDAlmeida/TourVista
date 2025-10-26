import React from 'react';

export const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 justify-center px-4 py-3 font-semibold text-sm transition-all duration-200 ease-in-out focus:outline-none rounded-t-lg border-b-2
    ${
      isActive
        ? 'bg-slate-800 text-cyan-300 border-cyan-400'
        : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border-transparent'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);