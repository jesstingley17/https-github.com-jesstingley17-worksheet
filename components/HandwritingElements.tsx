
import React from 'react';

export const MarkerHighlight: React.FC<{ children: React.ReactNode; className?: string; color?: string }> = ({ children, className, color = 'rgba(253, 224, 71, 0.4)' }) => (
  <span 
    className={`font-handwriting-header ${className}`}
    style={{ 
      background: `linear-gradient(100deg, ${color} 0%, ${color.replace('0.4', '0.7')} 50%, ${color} 100%)`,
      borderRadius: '2px',
      padding: '0 4px'
    }}
  >
    {children}
  </span>
);

// Define the missing DoodleStar component for decorative use
export const DoodleStar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-yellow-500">
    <path d="M12 2.5L14.7 9H21.5L16 13L18 20L12 16L6 20L8 13L2.5 9H9.3L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const HelenCharacter = () => (
  <div className="relative inline-block scale-75 origin-top-left">
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path d="M20 80C20 60 30 45 50 45C70 45 80 60 80 80V85H20V80Z" fill="white" stroke="black" strokeWidth="2.5"/>
      {/* Head */}
      <circle cx="50" cy="35" r="25" fill="white" stroke="black" strokeWidth="2.5"/>
      {/* Face */}
      <circle cx="42" cy="35" r="1.5" fill="black"/>
      <circle cx="58" cy="35" r="1.5" fill="black"/>
      <path d="M48 42C48 42 50 43.5 52 42" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Pen */}
      <rect x="75" y="40" width="8" height="45" rx="4" fill="white" stroke="black" strokeWidth="2" transform="rotate(10, 75, 40)"/>
    </svg>
    <div className="absolute -top-10 -right-28 w-32">
      <div className="relative bg-white border border-black rounded-xl p-2 text-[9px] leading-tight font-handwriting-body">
        Helen likes the Pentel EnerGel Clena @ 0.5mm!
        <div className="absolute -bottom-1.5 left-3 w-2 h-2 bg-white border-b border-l border-black -rotate-45"></div>
      </div>
    </div>
  </div>
);

export const HandDrawnArrow = ({ className }: { className?: string }) => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M10 10C15 15 20 25 20 35M20 35L15 30M20 35L25 30" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const HandwritingLabels = () => (
  <div className="flex justify-end gap-16 mb-6 pr-12 mt-2">
    <div className="text-center flex flex-col items-center">
      <span className="font-handwriting-body text-[10px] italic leading-tight">Reference of<br/>writing sample</span>
      <HandDrawnArrow className="mt-1 rotate-12" />
    </div>
    <div className="text-center flex flex-col items-center">
      <span className="font-handwriting-body text-[10px] italic leading-tight">Trace & get<br/>familiar</span>
      <HandDrawnArrow className="mt-1 -rotate-6" />
    </div>
    <div className="text-center flex flex-col items-center">
      <span className="font-handwriting-body text-[10px] italic leading-tight">your turn!</span>
      <div className="w-24 h-[1px] bg-black mt-4 rounded-full"></div>
    </div>
  </div>
);

export const DraggableLineRow: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-8 py-0.5 border-b border-slate-100/50">
    <div className="w-16 font-handwriting-body text-2xl text-slate-900 truncate">{text}</div>
    <div className="w-24 font-handwriting-body text-2xl text-slate-300 select-none">{text}</div>
    <div className="w-24 font-handwriting-body text-2xl text-slate-100 select-none">{text}</div>
    <div className="flex-1 h-6 dotted-line opacity-30"></div>
  </div>
);

export const SymbolDrillRow: React.FC<{ symbols: string }> = ({ symbols }) => (
  <div className="flex flex-col gap-2 py-4">
    <div className="font-handwriting-body text-3xl tracking-[0.5em] text-slate-900">{symbols}</div>
    <div className="font-handwriting-body text-3xl tracking-[0.5em] text-slate-200 select-none">{symbols}</div>
    <div className="h-10 dotted-line opacity-30 w-full"></div>
  </div>
);

export const HandDrawnDivider = () => (
  <div className="w-full h-1 hand-drawn-border my-6 opacity-40"></div>
);
