export default function AIMentorCharacter() {
  return (
    <div className="relative w-24 h-24">
      {/* Head */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-4 border-white shadow-lg">
        {/* Hair */}
        <div className="absolute -top-2 left-1 w-14 h-8 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-full" />
        
        {/* Glasses Frame */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1">
          {/* Left lens */}
          <div className="w-5 h-4 rounded-full border-2 border-slate-800 bg-blue-100/40" />
          {/* Bridge */}
          <div className="w-1 h-0.5 bg-slate-800 self-center" />
          {/* Right lens */}
          <div className="w-5 h-4 rounded-full border-2 border-slate-800 bg-blue-100/40" />
        </div>
        
        {/* Eyes behind glasses */}
        <div className="absolute top-6 left-4 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        <div className="absolute top-6 right-4 w-1.5 h-1.5 bg-slate-800 rounded-full" />
        
        {/* Nose */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-2 h-3 bg-amber-300 rounded-full" />
        
        {/* Smile */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 border-b-2 border-slate-700 rounded-full" />
      </div>
      
      {/* Collar/Shirt */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-b-2xl border-4 border-white shadow-lg overflow-hidden">
        {/* Tie */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-6 bg-gradient-to-b from-red-600 to-red-700 clip-path-polygon" 
             style={{ clipPath: 'polygon(50% 0%, 0% 0%, 35% 100%, 65% 100%, 100% 0%)' }} />
      </div>
      
      {/* Sparkle effect - indicating AI */}
      <div className="absolute -top-1 -right-1 w-4 h-4">
        <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute w-2 h-2 bg-blue-400 rounded-full" />
      </div>
    </div>
  );
}