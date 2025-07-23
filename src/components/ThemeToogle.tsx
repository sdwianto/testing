import { useState, useEffect, type JSX } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Hook untuk mengatasi hydration mismatch
function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

type Theme = 'dark' | 'light' | 'system';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  hasMounted: boolean;
}

// Hook untuk theme management
function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>('light');
  const hasMounted = useHasMounted();

  useEffect(() => {
    // Hanya jalankan di client side setelah hydration
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    // Apply theme ke document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = (): void => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { theme, toggleTheme, hasMounted };
}

// Theme Toggle Component
export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme, hasMounted } = useTheme();

  // Prevent hydration mismatch dengan tidak render apapun sebelum mounted
  if (!hasMounted) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Dark Mode
        </>
      ) : (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Light Mode
        </>
      )}
    </Button>
  );
}

// Alternative: Icon-only version untuk menghindari text mismatch
export function ThemeToggleIcon(): JSX.Element {
  const { theme, toggleTheme, hasMounted } = useTheme();

  if (!hasMounted) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}