// src/components/ThemeToggleButton.tsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { IconMoon, IconSun } from "@tabler/icons-react";

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full transition-colors duration-200 hover:opacity-85  cursor-pointer"
      title="Cambiar Tema"
    >
      {theme === "dark" ? (
        <IconSun size={20} className="text-yellow-400" />
      ) : (
        <IconMoon size={20} className="text-text-100" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
