import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useSettings } from '../../context/SettingsContext'
import Toggle from '../Toggle'

const ThemeToggle = () => {
  const { theme } = useTheme()
  const { updateSetting } = useSettings()

  const isDark = theme === 'dark'

  const handleThemeChange = (val) => {
    const newTheme = val ? 'dark' : 'light'
    updateSetting('theme', newTheme)
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Toggle
        checked={isDark}
        onChange={handleThemeChange}
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

export default ThemeToggle
