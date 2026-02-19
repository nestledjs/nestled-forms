import { createContext, useContext } from 'react'
import { defaultNativeTheme, NativeTheme } from './themes/default'

export const NativeThemeContext = createContext<NativeTheme>(defaultNativeTheme)

export function useNativeTheme(): NativeTheme {
  return useContext(NativeThemeContext)
}
