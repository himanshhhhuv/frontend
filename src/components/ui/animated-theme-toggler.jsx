import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";

export const AnimatedThemeToggler = ({
  className,
  duration = 500,
  ...props
}) => {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sync isDark state with theme changes
  useEffect(() => {
    const updateIsDark = () => {
      const root = document.documentElement;
      setIsDark(root.classList.contains("dark"));
    };

    updateIsDark();

    // Watch for class changes on documentElement
    const observer = new MutationObserver(updateIsDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also listen to system theme changes if using system theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (theme === "system") updateIsDark();
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // Determine the new theme based on current state
    const currentIsDark = document.documentElement.classList.contains("dark");
    const newTheme = currentIsDark ? "light" : "dark";

    // Use view transition API if available for smooth animation
    const transition = document.startViewTransition
      ? await document.startViewTransition(() => {
          flushSync(() => {
            // Update theme through ThemeProvider
            setTheme(newTheme);
          });
        })
      : null;

    if (transition) {
      await transition.ready;

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } else {
      // Fallback if view transition API is not supported
      setTheme(newTheme);
    }
  }, [setTheme, duration]);

  return (
    <button
      
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
