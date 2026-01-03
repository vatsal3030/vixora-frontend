import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { settingsService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from './ThemeContext'
import { useToast } from '../components/ui/toast'

const SettingsContext = createContext()

// Local settings (stored in localStorage)
const defaultLocalSettings = {
  theme: 'system',
  primaryColor: '#EF4444',
  fontSize: 'medium',
  fontFamily: 'inter',
  gridColumns: 4,
  compactMode: false
}

// Database settings (synced with backend)
const defaultDbSettings = {
  // Privacy
  profileVisibility: 'PUBLIC',
  showSubscriptions: true,
  showLikedVideos: true,
  allowComments: true,
  allowMentions: true,
  
  // Notifications
  emailNotifications: true,
  commentNotifications: true,
  subscriptionNotifications: true,
  systemAnnouncements: true,
  
  // Playback
  autoplayNext: true,
  defaultPlaybackSpeed: 1.0,
  saveWatchHistory: true,
  
  // Display
  showProgressBar: true,
  showViewCount: true,
  showVideoDuration: true,
  showChannelName: true,
  
  // Content
  personalizeRecommendations: true,
  showTrending: true,
  hideShorts: false
}

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_SETTINGS':
      return {
        ...state,
        dbSettings: { ...defaultDbSettings, ...action.payload },
        originalDbSettings: { ...defaultDbSettings, ...action.payload },
        loading: false
      }
    case 'UPDATE_LOCAL_SETTING':
      const newLocalSettings = { ...state.localSettings, [action.key]: action.value }
      localStorage.setItem('localSettings', JSON.stringify(newLocalSettings))
      return {
        ...state,
        localSettings: newLocalSettings
      }
    case 'UPDATE_DB_SETTING':
      return {
        ...state,
        dbSettings: {
          ...state.dbSettings,
          [action.key]: action.value
        },
        hasUnsavedChanges: true
      }
    case 'DISCARD_CHANGES':
      return {
        ...state,
        dbSettings: state.originalDbSettings,
        hasUnsavedChanges: false
      }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_SAVING':
      return { ...state, saving: action.saving }
    case 'SET_SAVED':
      return {
        ...state,
        hasUnsavedChanges: false,
        originalDbSettings: state.dbSettings,
        lastSaved: new Date().toISOString(),
        saving: false
      }
    case 'SET_ERROR':
      return { ...state, error: action.error, saving: false }
    case 'RESET_SETTINGS':
      localStorage.setItem('localSettings', JSON.stringify(defaultLocalSettings))
      return {
        ...state,
        localSettings: defaultLocalSettings,
        dbSettings: defaultDbSettings,
        originalDbSettings: defaultDbSettings,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }
    default:
      return state
  }
}

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  const { toast } = useToast()
  
  const [state, dispatch] = useReducer(settingsReducer, {
    localSettings: (() => {
      try {
        const saved = localStorage.getItem('localSettings')
        return saved ? { ...defaultLocalSettings, ...JSON.parse(saved) } : defaultLocalSettings
      } catch {
        return defaultLocalSettings
      }
    })(),
    dbSettings: defaultDbSettings,
    originalDbSettings: defaultDbSettings,
    loading: false,
    saving: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    error: null
  })

  // Apply local settings to UI
  const applyLocalSettingsToUI = useCallback((localSettings) => {
    const root = document.documentElement
    
    // Apply theme
    if (localSettings.theme && setTheme) {
      setTheme(localSettings.theme)
    }
    
    // Apply font family
    if (localSettings.fontFamily) {
      const fontMap = {
        'inter': "'Inter', system-ui, -apple-system, sans-serif",
        'jakarta': "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        'grotesk': "'Space Grotesk', 'Inter', system-ui, sans-serif",
        'roboto': "'Roboto', 'Inter', system-ui, sans-serif",
        'poppins': "'Poppins', 'Inter', system-ui, sans-serif",
        'ghost': "'Spectral (Ghost)', 'Inter', system-ui, sans-serif",
      }
      const fontFamily = fontMap[localSettings.fontFamily] || fontMap['inter']
      document.body.style.fontFamily = fontFamily
    }
    
    // Apply primary color by adding theme class
    if (localSettings.primaryColor) {
      root.classList.remove('theme-red', 'theme-orange', 'theme-amber', 'theme-green', 'theme-blue', 'theme-sky', 'theme-indigo', 'theme-purple', 'theme-pink', 'theme-teal', 'theme-cyan', 'theme-lime')
      
      const colorMap = {
        '#EF4444': 'theme-red',
        '#F97316': 'theme-orange', 
        '#EAB308': 'theme-amber',
        '#3B82F6': 'theme-blue',
        '#0EA5E9': 'theme-ocean',
        '#6366F1': 'theme-indigo',
        '#8B5CF6': 'theme-purple',
        '#EC4899': 'theme-pink',
        '#14B8A6': 'theme-teal',
        '#22C55E': 'theme-green',
        '#84CC16': 'theme-lime'
      }
      
      const themeClass = colorMap[localSettings.primaryColor]
      if (themeClass) {
        root.classList.add(themeClass)
      } else {
        root.style.setProperty('--primary', localSettings.primaryColor)
      }
    }
    
    // Apply font size
    if (localSettings.fontSize) {
      const sizeMap = { small: '14px', medium: '16px', large: '18px' }
      root.style.setProperty('--font-size-base', sizeMap[localSettings.fontSize])
    }
    
    // Apply grid columns
    if (localSettings.gridColumns) {
      root.style.setProperty('--grid-columns', localSettings.gridColumns.toString())
    }
    
    // Apply compact mode
    if (localSettings.compactMode !== undefined) {
      root.classList.toggle('compact-mode', localSettings.compactMode)
    }
  }, [setTheme])

  // Apply local settings immediately on mount
  useEffect(() => {
    applyLocalSettingsToUI(state.localSettings)
  }, [])

  // Load DB settings from backend
  const loadDbSettings = useCallback(async () => {
    if (!user) return
    
    try {
      dispatch({ type: 'SET_LOADING', loading: true })
      const response = await settingsService.getSettings()
      const dbSettings = response.data.data
      
      dispatch({ type: 'LOAD_SETTINGS', payload: dbSettings })
    } catch (error) {
      console.error('Failed to load settings:', error)
      dispatch({ type: 'SET_ERROR', error: 'Failed to load settings' })
    }
  }, [user])

  // Apply local settings on mount and when they change
  useEffect(() => {
    applyLocalSettingsToUI(state.localSettings)
  }, [state.localSettings, applyLocalSettingsToUI])

  // Load DB settings when user changes
  useEffect(() => {
    if (user) {
      loadDbSettings()
    }
  }, [user, loadDbSettings])

  // Debounced save function for DB settings only
  const debouncedSave = useCallback(
    debounce(async (dbSettings) => {
      if (!user) return
      
      try {
        dispatch({ type: 'SET_SAVING', saving: true })
        await settingsService.updateSettings(dbSettings)
        dispatch({ type: 'SET_SAVED' })
        toast.success('Settings Saved', 'Your preferences have been updated')
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: error.message })
        toast.error('Save Failed', error.response?.data?.message || 'Failed to save settings')
      }
    }, 800),
    [user, toast]
  )

  // Update setting (automatically determines local vs DB)
  const updateSetting = (key, value) => {
    const isLocalSetting = ['theme', 'primaryColor', 'fontSize', 'fontFamily', 'gridColumns', 'compactMode'].includes(key)
    
    if (isLocalSetting) {
      dispatch({ type: 'UPDATE_LOCAL_SETTING', key, value })
      applyLocalSettingsToUI({ [key]: value })
    } else {
      dispatch({ type: 'UPDATE_DB_SETTING', key, value })
    }
  }

  // Manual save for DB settings
  const saveSettings = async () => {
    if (!user) return
    
    try {
      dispatch({ type: 'SET_SAVING', saving: true })
      await settingsService.updateSettings(state.dbSettings)
      dispatch({ type: 'SET_SAVED' })
      toast.success('Settings Saved', 'All changes have been saved')
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
      toast.error('Save Failed', error.response?.data?.message || 'Failed to save settings')
    }
  }

  // Reset settings
  const resetSettings = async () => {
    try {
      dispatch({ type: 'SET_SAVING', saving: true })
      
      if (user) {
        await settingsService.resetSettings()
      }
      
      dispatch({ type: 'RESET_SETTINGS' })
      applyLocalSettingsToUI(defaultLocalSettings)
      toast.success('Settings Reset', 'All settings have been reset to defaults')
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
      toast.error('Reset Failed', 'Failed to reset settings')
    }
  }

  // Discard changes
  const discardChanges = () => {
    dispatch({ type: 'DISCARD_CHANGES' })
  }

  const value = {
    ...state,
    updateSetting,
    saveSettings,
    resetSettings,
    loadDbSettings,
    discardChanges,
    settings: { ...state.localSettings, ...state.dbSettings }
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}