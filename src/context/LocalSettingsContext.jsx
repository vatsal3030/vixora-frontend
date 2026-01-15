import { createContext, useContext, useReducer, useEffect } from 'react'
import { useTheme } from './ThemeContext'

const LocalSettingsContext = createContext()

// Default settings stored in localStorage
const defaultSettings = {
  theme: 'system',
  gridColumns: 4,
  fontSize: 'medium',
  compactMode: false,
  showProgressBar: true,
  showViewCount: true,
  showVideoDuration: true,
  showChannelName: true,
  primaryColor: '#ef4444',
  autoplayNext: true,
  defaultVolume: 80,
  personalizeRecommendations: true,
  showTrending: true,
  hideShorts: false
}

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: { ...defaultSettings, ...action.payload }
      }
    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: action.value
        },
        lastSaved: new Date().toISOString(),
        saveStatus: 'saved'
      }
    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: defaultSettings,
        lastSaved: new Date().toISOString(),
        saveStatus: 'reset'
      }
    case 'CLEAR_SAVE_STATUS':
      return {
        ...state,
        saveStatus: null
      }
    default:
      return state
  }
}

export const LocalSettingsProvider = ({ children }) => {
  const { setTheme } = useTheme()
  const [state, dispatch] = useReducer(settingsReducer, {
    settings: defaultSettings,
    lastSaved: null,
    saveStatus: null
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        dispatch({ type: 'LOAD_SETTINGS', payload: parsed })
        
        // Apply theme immediately
        if (parsed.theme) {
          setTheme(parsed.theme)
        }
        
        // Apply primary color
        if (parsed.primaryColor) {
          document.documentElement.style.setProperty('--primary', parsed.primaryColor)
        }
      } catch (error) {
        // Failed to load settings
      }
    }
  }, [setTheme])

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state.settings))
  }, [state.settings])

  // Clear save status after 3 seconds
  useEffect(() => {
    if (state.saveStatus) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_SAVE_STATUS' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.saveStatus])

  const updateSetting = (key, value) => {
    dispatch({ type: 'UPDATE_SETTING', key, value })
    
    // Apply changes immediately
    if (key === 'theme') {
      setTheme(value)
    }
    
    if (key === 'primaryColor') {
      document.documentElement.style.setProperty('--primary', value)
    }
    
    if (key === 'fontSize') {
      document.documentElement.style.setProperty('--font-size', 
        value === 'small' ? '14px' : value === 'large' ? '18px' : '16px'
      )
    }
  }

  const resetSettings = () => {
    dispatch({ type: 'RESET_SETTINGS' })
    setTheme(defaultSettings.theme)
    document.documentElement.style.setProperty('--primary', defaultSettings.primaryColor)
  }

  const value = {
    settings: state.settings,
    lastSaved: state.lastSaved,
    saveStatus: state.saveStatus,
    updateSetting,
    resetSettings
  }

  return (
    <LocalSettingsContext.Provider value={value}>
      {children}
    </LocalSettingsContext.Provider>
  )
}

export const useLocalSettings = () => {
  const context = useContext(LocalSettingsContext)
  if (!context) {
    throw new Error('useLocalSettings must be used within a LocalSettingsProvider')
  }
  return context
}