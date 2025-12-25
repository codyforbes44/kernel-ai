import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface RecentPage {
  path: string;
  title: string;
  timestamp: number;
}

const MAX_RECENT_PAGES = 5;
const STORAGE_KEY = "kernel-recent-pages";

export function useCommandNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const navigate = useNavigate();

  // Load recent pages from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentPages(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const addRecentPage = useCallback((path: string, title: string) => {
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.path !== path);
      const updated = [{ path, title, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENT_PAGES
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  const navigateTo = useCallback(
    (path: string, title: string) => {
      addRecentPage(path, title);
      close();
      
      // Handle anchor links
      if (path.startsWith("#")) {
        const element = document.getElementById(path.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      
      navigate(path);
    },
    [navigate, addRecentPage, close]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    recentPages,
    navigateTo,
    addRecentPage,
  };
}
