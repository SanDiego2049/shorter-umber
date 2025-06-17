// themeUtils.js

// Function to get system theme preference
export const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Function to get initial theme - defaults to system, then checks localStorage
export const getInitialTheme = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return "light";

  try {
    const savedTheme = localStorage.getItem("theme");

    // If no saved theme, use system default
    if (!savedTheme) {
      return getSystemTheme();
    }

    // If saved theme is 'system', get current system preference
    if (savedTheme === "system") {
      return getSystemTheme();
    }

    // Return saved theme if it's valid
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Fallback to system theme
    return getSystemTheme();
  } catch (error) {
    console.warn("Could not access localStorage:", error);
    return getSystemTheme();
  }
};

// Function to get the theme mode (what's actually stored in localStorage)
export const getThemeMode = () => {
  if (typeof window === "undefined") return "system";

  try {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "system";
  } catch (error) {
    console.warn("Could not access localStorage:", error);
    return "system";
  }
};

// Function to apply a dark theme
export const applyDarkTheme = (setThemeMode, setActualTheme) => {
  setThemeMode("dark");
  setActualTheme("dark");
  try {
    localStorage.setItem("theme", "dark");
  } catch (error) {
    console.warn("Could not save theme to localStorage:", error);
  }
};

// Function to apply a light theme
export const applyLightTheme = (setThemeMode, setActualTheme) => {
  setThemeMode("light");
  setActualTheme("light");
  try {
    localStorage.setItem("theme", "light");
  } catch (error) {
    console.warn("Could not save theme to localStorage:", error);
  }
};

// Function to apply system theme
export const applySystemTheme = (setThemeMode, setActualTheme) => {
  const systemPreference = getSystemTheme();
  setThemeMode("system");
  setActualTheme(systemPreference);
  try {
    localStorage.setItem("theme", "system");
  } catch (error) {
    console.warn("Could not save theme to localStorage:", error);
  }
};

// Function to apply theme to document
export const applyThemeToDocument = (actualTheme) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(actualTheme);
  }
};

// Function to listen for system theme changes
export const setupSystemThemeListener = (themeMode, setActualTheme) => {
  if (typeof window === "undefined" || themeMode !== "system") return;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e) => {
    if (themeMode === "system") {
      const newTheme = e.matches ? "dark" : "light";
      setActualTheme(newTheme);
    }
  };

  mediaQuery.addEventListener("change", handleChange);

  // Return cleanup function
  return () => mediaQuery.removeEventListener("change", handleChange);
};
