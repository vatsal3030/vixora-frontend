import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './components/ui/toast'
import { Toaster } from './components/ui/sonner'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Video from './pages/Video'
import Channel from './pages/Channel'
import Upload from './pages/Upload'
import Login from './pages/Login'
import Register from './pages/Register'
import EmailVerification from './pages/EmailVerification'
import VerifyOtp from './pages/VerifyOtp'
import RestoreAccount from './pages/RestoreAccount'
import EditVideo from './pages/EditVideo'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Trending from './pages/Trending'
import Subscriptions from './pages/Subscriptions'
import MyVideos from './pages/MyVideos'
import History from './pages/History'
import LikedVideos from './pages/LikedVideos'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Shorts from './pages/Shorts'
import WatchLater from './pages/WatchLater'
import Playlists from './pages/Playlists'
import PlaylistView from './pages/PlaylistView'
import Tweets from './pages/Tweets'
import Trash from './pages/Trash'
import { useAuth } from './hooks/useAuth'
import Loader from './components/Loader'

// Custom component to handle @username routes
const ChannelRouter = () => {
  const location = useLocation()
  const pathname = location.pathname
  
  // Check if it's a @username route
  if (pathname.startsWith('/@')) {
    const username = pathname.slice(2) // Remove /@
    return <Channel key={username} username={username} />
  }
  
  // Return 404 or redirect for other unmatched routes
  return <div>Page not found</div>
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  return (
    <ToastProvider>
      <SettingsProvider>
        <SidebarProvider>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/restore-account" element={<RestoreAccount />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shorts" element={<Shorts />} />
              <Route path="trending" element={<Trending />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="my-videos" element={<MyVideos />} />
              <Route path="history" element={<History />} />
              <Route path="liked" element={<LikedVideos />} />
              <Route path="watch-later" element={<WatchLater />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="playlist/:playlistId" element={<PlaylistView />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="search" element={<Search />} />
              <Route path="video/:videoId" element={<Video />} />
              <Route path="video/:videoId/edit" element={<EditVideo />} />
              <Route path="channel/:channelId" element={<Channel />} />
              <Route path="*" element={<ChannelRouter />} />
              <Route path="upload" element={<Upload />} />
              <Route path="tweets" element={<Tweets />} />
              <Route path="trash" element={<Trash />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </SettingsProvider>
    </ToastProvider>
  )
}

export default App
