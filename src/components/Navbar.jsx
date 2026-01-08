import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSidebar } from '../context/SidebarContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import NotificationDropdown from './NotificationDropdown'
import ThemeToggle from './ui/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Upload, User, LogOut, Video, Search, Menu } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-2 sm:px-4 py-3">
      <div className="flex items-center justify-between max-w-full mx-auto">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="sm:hidden p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center space-x-2">
            <Video className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold hidden sm:block">Vixora</span>
          </Link>
        </div>

        {/* Search Bar */}
        {/* <div className="flex-1 max-w-4xl mx-1 sm:mx-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e)
                  }
                }}
                className="pr-2 sm:pr-10 md:pr-12 lg:pr-14 text-sm"
              />
              <button
                type="submit"
                className="bg- flex justify-center items-center absolute right-0 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div> */}

        <div className="flex-1 max-w-4xl mx-1 sm:mx-4">
          <form onSubmit={handleSearch} className="search-container">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                background: 'transparent'
              }}
            />
            <button type="submit">
              <Search />
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Button asChild variant="ghost" size="sm" className="hidden sm:flex p-2">
            <Link to="/upload" className="flex items-center">
              <Upload className="h-4 w-4" />
              <span className="hidden lg:inline ml-1">Upload</span>
            </Link>
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.fullName} />
                  <AvatarFallback className="text-sm">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-3 p-2">
                <button 
                  onClick={() => navigate(`/@${user?.username}`)}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback className="text-sm">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex flex-col space-y-1 leading-none min-w-0">
                  <p className="font-medium truncate">{user?.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/@${user?.username}`} className="flex items-center">
                  <Video className="mr-2 h-4 w-4" />
                  <span>My Channel</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default Navbar