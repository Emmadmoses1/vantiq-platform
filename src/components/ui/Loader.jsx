import React from 'react';

const Loader = ({ size = 'md', text }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin`} />
        <div className={`absolute inset-1 rounded-full border-2 border-cyan-500/20 border-b-cyan-500 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      {text && <p className="text-sm text-gray-500 font-mono tracking-wider animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
