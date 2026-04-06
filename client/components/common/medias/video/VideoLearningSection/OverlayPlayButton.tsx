import React from 'react'

interface OverlayPlayButtonProps {
  label: string
  ariaLabel?: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const OverlayPlayButton: React.FC<OverlayPlayButtonProps> = ({ label, ariaLabel = 'Play video', onClick }) => {
  return (
    <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center gap-3 pointer-events-auto backdrop-blur-sm">
      <p className="text-white/85 text-[13px] tracking-[0.4em] uppercase">
        {label}
      </p>
      <button
        className="group relative w-24 h-24 bg-transparent"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-sky-400/40 to-indigo-500/40 rounded-[32%] rotate-6 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[28%] rotate-6 border border-white/30 shadow-[0_15px_45px_rgba(15,23,42,0.45)] group-hover:scale-105 transition-transform" />
        <span className="absolute inset-4 bg-gradient-to-br from-white to-slate-100 rounded-[30%] rotate-6 flex items-center justify-center shadow-[0_10px_35px_rgba(15,23,42,0.25)]">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-slate-900 ml-1"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </div>
  )
}


