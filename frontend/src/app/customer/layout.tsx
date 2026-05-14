import { ThemeProvider } from "../context/ThemeContext";

export default function CustomerLayout({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}