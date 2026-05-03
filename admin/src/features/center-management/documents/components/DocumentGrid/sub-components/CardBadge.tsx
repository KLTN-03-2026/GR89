'use client'
interface CardBadgeProps {
  categoryName?: string
  variant?: 'default' | 'compact'
}

export function CardBadge({ categoryName, variant = 'default' }: CardBadgeProps) {
  if(variant === 'compact') return null
  return (
    <div className="absolute -top-1 -left-1 z-10 max-w-[80%] min-w-0">
      <div 
        className='px-2 py-1.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 text-[10px] font-black text-white uppercase tracking-0.1em line-clamp-1 break-all'
        title={categoryName || 'Tài liệu'}
      >
        {categoryName || 'Tài liệu'}
      </div>
    </div>
  )
}
