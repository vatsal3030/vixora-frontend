import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSidebar } from '../context/SidebarContext'
import { memo } from 'react'
import { 
  Home, 
  TrendingUp, 
  Users, 
  History, 
  ThumbsUp, 
  PlaySquare,
  BarChart3,
  Video,
  Clock,
  Menu,
  Trash2,
  Settings
} from 'lucide-react'
import { Button } from './ui/button'

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: PlaySquare, label: 'Shorts', path: '/shorts' },
  { icon: Users, label: 'Subscriptions', path: '/subscriptions' },
]

const userItems = [
  { icon: Video, label: 'Your Videos', path: '/my-videos' },
  { icon: History, label: 'History', path: '/history' },
  { icon: ThumbsUp, label: 'Liked Videos', path: '/liked' },
  { icon: Clock, label: 'Watch Later', path: '/watch-later' },
  { icon: PlaySquare, label: 'Playlists', path: '/playlists' },
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
  { icon: Trash2, label: 'Trash', path: '/trash' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const Sidebar = memo(() => {
  const { user } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 sm:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border overflow-y-auto z-40 will-change-transform
        transition-transform duration-300 ease-in-out
        sm:block
        ${
          isCollapsed 
            ? '-translate-x-full sm:translate-x-0 sm:w-16' 
            : 'translate-x-0 w-52 sm:w-52 md:w-56 lg:w-60'
        }
      `}>
      <div className="p-2 pt-4">
        {/* Toggle Button */}
        <div className="mb-2 pb-2 border-b border-border hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`w-full p-2 flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          >
            <Menu className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Collapse</span>}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'sidebar-link-active'
                  : 'text-foreground'
              } ${isCollapsed ? 'justify-center' : 'space-x-2'}`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* User Section */}
        {user && (
          <div>
            {!isCollapsed && (
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Library
              </h3>
            )}
            <nav className="space-y-0.5">
              {userItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'sidebar-link-active'
                      : 'text-foreground'
                  } ${isCollapsed ? 'justify-center' : 'space-x-2'}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </aside>
    </>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar