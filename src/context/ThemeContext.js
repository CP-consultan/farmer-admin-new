"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  const saveTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const [effectiveTheme, setEffectiveTheme] = useState('light');
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setEffectiveTheme(prefersDark ? 'dark' : 'light');
      } else {
        setEffectiveTheme(theme);
      }
    };

    updateEffectiveTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => updateEffectiveTheme();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  const colors = {
    light: {
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#333333',
      subtext: '#666666',
      border: '#E0E0E0',
      primary: '#2d6a4f',
      accent: '#4c669f',
      error: '#D32F2F',
      success: '#4CAF50',
    },
    dark: {
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      subtext: '#AAAAAA',
      border: '#333333',
      primary: '#2d6a4f',
      accent: '#4c669f',
      error: '#CF6679',
      success: '#4CAF50',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: saveTheme, colors: colors[effectiveTheme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
