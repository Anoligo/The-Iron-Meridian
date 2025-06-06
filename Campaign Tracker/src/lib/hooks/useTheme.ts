import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'high-contrast';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // Set theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark theme if no preference is saved
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsMounted(true);
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    if (!isMounted) return;
    
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);
    // Update local storage
    localStorage.setItem('theme', theme);
  }, [theme, isMounted]);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme: toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isHighContrast: theme === 'high-contrast',
  };
}
