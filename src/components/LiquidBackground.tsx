import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#fafafa]">
      {/* Vercel-style subtle dot grid matrix */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#d4d4d8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft Apple subtle ambient vignette */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
};
