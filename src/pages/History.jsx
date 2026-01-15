import { useState, useEffect } from 'react'
import { watchHistoryService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import VideoGrid from '../components/VideoGrid'
import HomePageSkeleton from '../components/skeletons/HomePageSkeleton'

const History = () => {
  useDocumentTitle('History')

  const fetchHistory = async (page) => {
    const response = await watchHistoryService.getContinueWatching()
    
    // Handle the correct response structure from backend
    let videosData = []
    if (response?.data?.data) {
      if (response.data.data.videos) {
        // Backend returns { videos: [...], pagination: {...} }
        videosData = response.data.data.videos
      } else if (Array.isArray(response.data.data)) {
        // Direct array
        videosData = response.data.data
      }
    }

    // Extract video data from watch history entries
    const extractedVideos = videosData.map(item => {
      // Backend returns { progress, duration, updatedAt, video: {...} }
      if (item.video) {
        return {
          ...item.video,
          watchProgress: item.progress || 0,
          watchedAt: item.updatedAt
        }
      }
      // Fallback if structure is different
      return item
    })

    return Array.isArray(extractedVideos) ? extractedVideos : []
  }

  const { data: videos, loading, error, hasMore, observerRef } = useInfiniteScroll(fetchHistory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Watch History</h1>
      
      {loading && videos.length === 0 ? (
        <HomePageSkeleton />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Try Again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No watch history yet</p>
          <p className="text-muted-foreground/70 mt-2">Videos you watch will appear here</p>
        </div>
      ) : (
        <>
          <VideoGrid videos={videos} />
          {hasMore && <div ref={observerRef} className="h-20 flex items-center justify-center"><HomePageSkeleton /></div>}
        </>
      )}
    </div>
  )
}

export default History