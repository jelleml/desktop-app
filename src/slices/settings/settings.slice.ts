import { createSlice } from '@reduxjs/toolkit'

interface SettingsState {
  bitcoinUnit: string
  nodeConnectionString: string
  language: string
}

// Load initial language from localStorage (where i18n stores it)
const getInitialLanguage = (): string => {
  try {
    return localStorage.getItem('kaleidoswap_language') || 'en'
  } catch {
    return 'en'
  }
}

const initialState: SettingsState = {
  bitcoinUnit: 'SAT',
  language: getInitialLanguage(),
  nodeConnectionString: 'http://localhost:3001',
}

export const settingsSlice = createSlice({
  initialState,
  name: 'settings',
  reducers: {
    setBitcoinUnit(state, action) {
      state.bitcoinUnit = action.payload
    },
    setLanguage(state, action) {
      state.language = action.payload
      // Also save to localStorage so i18n can read it on next app start
      try {
        localStorage.setItem('kaleidoswap_language', action.payload)
      } catch {
        // Silently fail if localStorage is not available
      }
    },
    setNodeConnectionString(state, action) {
      state.nodeConnectionString = action.payload
    },
  },
})

export const { setBitcoinUnit, setLanguage, setNodeConnectionString } =
  settingsSlice.actions
export const settingsReducer = settingsSlice.reducer
