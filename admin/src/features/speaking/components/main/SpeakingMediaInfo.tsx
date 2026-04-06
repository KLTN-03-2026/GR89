'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Video, Download } from 'lucide-react';

interface MediaInfo {
  _id: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
}

interface SpeakingMediaInfoProps {
  videoMedia: MediaInfo;
  subtitleUrl?: string;
}

export function SpeakingMediaInfo({
  videoMedia,
  subtitleUrl
}: SpeakingMediaInfoProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1024 / 1024) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          <span className="font-medium">Video</span>
        </div>

        <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(videoMedia.url, '_blank')}
              className="h-8 px-2"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Xem Video
            </Button>
            <Badge variant="outline">{videoMedia.format?.toUpperCase()}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Kích thước: {formatFileSize(videoMedia.size)}</div>
            {videoMedia.duration && (
              <div>Thời lượng: {formatDuration(videoMedia.duration)}</div>
            )}
            {videoMedia.width && videoMedia.height && (
              <div>Độ phân giải: {videoMedia.width}x{videoMedia.height}</div>
            )}
            <div>Public ID: {videoMedia.publicId}</div>
          </div>
        </div>
      </div>

      {/* Subtitle Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Subtitle</span>
        </div>

        {subtitleUrl ? (
          <div className="p-3 border rounded-lg bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(subtitleUrl, '_blank')}
              className="h-8 px-2"
            >
              <Download className="w-4 h-4 mr-1" />
              Tải Subtitle
            </Button>
            <div className="text-xs text-muted-foreground mt-2">
              URL: {subtitleUrl}
            </div>
          </div>
        ) : (
          <div className="p-3 border rounded-lg bg-gray-50 text-muted-foreground">
            Chưa có subtitle
          </div>
        )}
      </div>
    </div>
  );
}
