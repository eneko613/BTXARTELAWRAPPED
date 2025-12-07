
import React from 'react';

interface StoryCardProps {
  title: string;
  children: React.ReactNode;
  footerText?: string;
  onDownload?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ title, children, footerText }) => {
  return (
    <div className="flex flex-col items-center gap-4 group w-full max-w-[320px]">
      <div 
        className="relative w-full aspect-[9/16] bg-gradient-to-br from-barik-red via-[#b31b1b] to-[#5e0f0f] text-white shadow-2xl rounded-3xl overflow-hidden flex flex-col font-sans transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(218,41,28,0.3)] group-hover:-translate-y-2 border border-white/10"
      >
        {/* Background Texture/Pattern: White dots */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
             style={{ 
                 backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1.5px)', 
                 backgroundSize: '24px 24px' 
             }}>
        </div>
        
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

        {/* Header */}
        <div className="pt-8 px-6 z-10 w-full flex justify-between items-center">
             <div className="font-bold text-xl tracking-tighter italic drop-shadow-md">barik<span className="font-light opacity-90">wrapped</span></div>
             <div className="text-xs font-mono opacity-60 border border-white/20 px-2 py-0.5 rounded-full">2025</div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 z-10 w-full">
            <h2 className="text-3xl font-black mb-8 leading-none drop-shadow-md text-white uppercase text-center tracking-wide">{title}</h2>
            <div className="space-y-4">
                {children}
            </div>
        </div>

        {/* Footer */}
        <div className="pb-8 px-6 z-10 w-full text-center">
           {footerText && (
               <span className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 shadow-lg group-hover:scale-105">
                   {footerText}
               </span>
           )}
        </div>
      </div>
    </div>
  );
};
