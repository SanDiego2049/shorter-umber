// ThemeToggler.jsx
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggler = () => {
  const { themeMode, actualTheme, darkTheme, lightTheme, systemTheme } =
    useTheme();

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50">
      <div className="hidden lg:block dark:bg-gray-800/90 backdrop-blur-2xl rounded-full p-1 shadow-2xl border border-gray-700/50">
        {/* Light Theme Button */}
        <button
          onClick={lightTheme}
          className={`
            cursor-pointer relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-1
            ${
              themeMode === "light"
                ? "bg-white text-gray-800 shadow-lg"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
            }
          `}
          title="Light Theme"
        >
          <Sun className="w-5 h-5" />
        </button>

        {/* Separator */}
        <div className="w-8 h-px bg-gray-600 mx-auto my-2"></div>

        {/* System Theme Button */}
        <button
          onClick={systemTheme}
          className={`
            cursor-pointer relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-1
            ${
              themeMode === "system"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
            }
          `}
          title={`System Theme (Currently ${actualTheme})`}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Separator */}
        <div className="w-8 h-px bg-gray-600 mx-auto my-2"></div>

        {/* Dark Theme Button */}
        <button
          onClick={darkTheme}
          className={`
            cursor-pointer relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
            ${
              themeMode === "dark"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
            }
          `}
          title="Dark Theme"
        >
          <Moon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ThemeToggler;
