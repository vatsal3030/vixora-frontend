import { useState, useEffect, lazy, Suspense } from 'react'
import { feedService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import VideoGrid from '../components/VideoGrid'
import HomePageSkeleton from '../components/skeletons/HomePageSkeleton'

const VideoCard = lazy(() => import('../components/VideoCard'))

const Trending = () => {
  useDocumentTitle('Trending')

  const fetchTrendingVideos = async (page) => {
    const response = await feedService.getTrendingFeed()
    const videosData =
      response?.data?.data?.docs ||
      response?.data?.data?.videos ||
      response?.data?.data ||
      [];

    return Array.isArray(videosData) ? videosData : []
  }

  const { data: videos, loading, error, hasMore, observerRef } = useInfiniteScroll(fetchTrendingVideos)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Trending Videos</h1>

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
          <p className="text-muted-foreground text-lg">No trending videos found</p>
        </div>
      ) : (
        <>
          <VideoGrid videos={videos} loading={false} />
          {hasMore && <div ref={observerRef} className="h-20 flex items-center justify-center"><HomePageSkeleton /></div>}
        </>
      )}
    </div>
  )
}

export default Trending