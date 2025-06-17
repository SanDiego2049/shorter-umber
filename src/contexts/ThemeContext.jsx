// ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  getInitialTheme,
  getThemeMode,
  applyDarkTheme,
  applyLightTheme,
  applySystemTheme,
  applyThemeToDocument,
  setupSystemThemeListener,
} from "../lib/themeUtils";

// Create Theme Context
export const ThemeContext = createContext({
  themeMode: "system", // 'light', 'dark', or 'system'
  actualTheme: "light", // the actual theme being applied ('light' or 'dark')
  darkTheme: () => {},
  lightTheme: () => {},
  systemTheme: () => {},
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // themeMode is what the user selected ('system', 'light', 'dark')
  const [themeMode, setThemeMode] = useState(() => getThemeMode());
  // actualTheme is what's actually applied ('light' or 'dark')
  const [actualTheme, setActualTheme] = useState(() => getInitialTheme());

  // Apply theme to document whenever actualTheme changes
  useEffect(() => {
    applyThemeToDocument(actualTheme);
  }, [actualTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    const cleanup = setupSystemThemeListener(themeMode, setActualTheme);
    return cleanup;
  }, [themeMode]);

  // Theme functions
  const darkTheme = () => {
    applyDarkTheme(setThemeMode, setActualTheme);
  };

  const lightTheme = () => {
    applyLightTheme(setThemeMode, setActualTheme);
  };

  const systemTheme = () => {
    applySystemTheme(setThemeMode, setActualTheme);
  };

  const value = {
    themeMode, // 'system', 'light', or 'dark'
    actualTheme, // 'light' or 'dark' (what's actually applied)
    darkTheme,
    lightTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
