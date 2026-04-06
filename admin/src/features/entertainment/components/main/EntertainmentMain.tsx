'use client'
import { useState } from 'react'
import EntertainmentContent from './EntertainmentContent'
import EntertainmentHeader from './EntertainmentHeader'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface Props {
  type: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
}

export function EntertainmentMain({ type }: Props) {
  const [refresh, setRefresh] = useState(false)
  const [viewState, setViewState] = useState<{ parentId?: string; title?: string }>({})

  const handleRefresh = () => setRefresh(!refresh)

  return (
    <div className="space-y-6">
      {viewState.parentId ? (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setViewState({})}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại danh sách phim bộ
          </Button>
          <h2 className="text-xl font-bold italic text-primary">Tập phim của: {viewState.title}</h2>
        </div>
      ) : null}

      <EntertainmentHeader
        callback={handleRefresh}
        type={viewState.parentId ? 'episode' : type}
        parentId={viewState.parentId}
      />

      <EntertainmentContent
        refresh={refresh}
        callback={handleRefresh}
        type={viewState.parentId ? 'episode' : type}
        parentId={viewState.parentId}
        onManageEpisodes={(parentId, title) => setViewState({ parentId, title })}
      />
    </div>
  )
}


