'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface GoogleDrivePlayerProps {
  fileId?: string
  videoUrl?: string
  title?: string
}

export function GoogleDrivePlayer({ fileId, videoUrl, title = 'Video Player' }: GoogleDrivePlayerProps) {
  const [error, setError] = useState(false)

  // Extract Google Drive file ID from URL
  const extractFileId = (url: string): string | null => {
    if (!url) return null

    // Handle /file/d/ID/view format
    const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
    if (match1) return match1[1]

    // Handle /d/ID format
    const match2 = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match2) return match2[1]

    // If it's already a file ID
    if (/^[a-zA-Z0-9-_]+$/.test(url) && url.length > 20) {
      return url
    }

    return null
  }

  const getFileId = (): string | null => {
    if (fileId) return fileId
    if (videoUrl) return extractFileId(videoUrl)
    return null
  }

  const id = getFileId()

  if (!id) {
    return (
      <div className="w-full bg-black rounded-lg p-4 flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No valid video URL provided</p>
        </div>
      </div>
    )
  }

  const iframeUrl = `https://drive.google.com/file/d/${id}/preview`

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {error ? (
        <div className="w-full bg-black rounded-lg p-4 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Failed to load video</p>
            <p className="text-xs mt-2">Make sure the video link is shared publicly</p>
          </div>
        </div>
      ) : (
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          className="w-full aspect-video"
          allow="autoplay"
          onError={() => setError(true)}
          title={title}
        />
      )}
    </div>
  )
}
