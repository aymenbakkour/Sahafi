import React from 'react';
import { RssItem } from '../types';

interface NewsTickerProps {
  items: RssItem[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ items }) => {
  return (
   <div className="h-9 bg-slate-950 text-white flex items-center overflow-hidden text-xs z-50 shadow-xl border-b border-slate-800" dir="ltr">

  {/* عاجل - Keep on the Left for LTR layout or Right for RTL? 
      User wants ticker to move Left -> Right. 
      Usually "Breaking" label is at the start of the reading direction.
      If moving L->R, maybe label should be on the Left?
      But the app is RTL. 
      Let's keep the label on the Right (Arabic default) but animate the text L->R.
  */}
  <div className="bg-red-600 px-6 h-full flex items-center justify-center font-black whitespace-nowrap z-20 order-last">
    عاجل
  </div>

  {/* شريط الأخبار */}
  <div className="relative flex-1 h-full overflow-hidden flex items-center">
    <div className="marquee whitespace-nowrap flex items-center gap-8 px-4">
      {items.length === 0 && (
        <span className="opacity-50 italic mx-10">جاري تحميل الأخبار العالمية...</span>
      )}

      {items.map((item, idx) => (
        <span key={idx} className="inline-flex items-center gap-2">
          <span className="font-bold text-yellow-400">[{item.source}]</span>
          <span className="font-medium">{item.title}</span>
          <span className="text-slate-600 mx-2">•</span>
        </span>
      ))}
    </div>
  </div>

  <style>{`
    @keyframes marquee {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    .marquee {
      animation: marquee 30s linear infinite;
      will-change: transform;
      position: absolute;
      left: 0;
      min-width: 100%;
    }

    .marquee:hover {
      animation-play-state: paused;
    }
  `}</style>

</div>
  );
};