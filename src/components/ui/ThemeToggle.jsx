import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else if (newTheme === 'light') {
      root.classList.remove('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  return (
    <div className="relative inline-grid grid-cols-3 items-center rounded-full bg-black/20 dark:bg-white/10 p-1">
      {/* Active indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(33.333%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
          theme === 'light' ? 'translate-x-0' : 
          theme === 'dark' ? 'translate-x-[calc(100%+0.25rem)]' : 
          'translate-x-[calc(200%+0.5rem)]'
        }`}
      />
      
      {/* Light */}
      <button
        onClick={() => handleThemeChange('light')}
        className="relative z-10 flex items-center justify-center p-1.5"
        title="Light"
      >
        <Sun className={`w-4 h-4 transition-colors ${
          theme === 'light' ? 'text-black' : 'text-gray-400'
        }`} strokeWidth={2} />
      </button>
      
      {/* Dark */}
      <button
        onClick={() => handleThemeChange('dark')}
        className="relative z-10 flex items-center justify-center p-1.5"
        title="Dark"
      >
        <Moon className={`w-4 h-4 transition-colors ${
          theme === 'dark' ? 'text-black' : 'text-gray-400'
        }`} strokeWidth={2} />
      </button>
      
      {/* System */}
      <button
        onClick={() => handleThemeChange('system')}
        className="relative z-10 flex items-center justify-center p-1.5"
        title="System"
      >
        <Monitor className={`w-4 h-4 transition-colors ${
          theme === 'system' ? 'text-black' : 'text-gray-400'
        }`} strokeWidth={2} />
      </button>
    </div>
  )
}

export default ThemeToggle
