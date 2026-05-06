import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  // Apply theme immediately when component mounts and update class
  useEffect(() => {
    const root = window.document.documentElement
    if (!dark) {
      root.classList.add('light-mode')
      root.classList.remove('dark')
    } else {
      root.classList.remove('light-mode')
      root.classList.add('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
