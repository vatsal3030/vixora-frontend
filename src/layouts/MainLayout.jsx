import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSidebar } from '../context/SidebarContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const MainLayout = () => {
  const { isAuthenticated } = useAuth()
  const { isCollapsed } = useSidebar()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'sm:pl-16' : 'sm:pl-52 md:pl-56 lg:pl-60'
      }`}>
        <div className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout