import { useEffect, useState } from 'react';
import { applyTheme, getPreferredTheme, toggleTheme } from '../lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((current) => toggleTheme(current)),
  };
}
