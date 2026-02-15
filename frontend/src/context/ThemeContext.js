import { createContext } from "react";

/**
 * ThemeContext provides:
 * - darkMode: boolean
 * - toggleTheme: function to switch dark/light mode
 */
const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

export default ThemeContext;
