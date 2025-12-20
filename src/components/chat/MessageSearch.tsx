import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/database";

interface MessageSearchProps {
  messages: Message[];
  onResultSelect: (messageId: string) => void;
  className?: string;
}

export function MessageSearch({ messages, onResultSelect, className }: MessageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(searchTerm) ||
        msg.role.toLowerCase().includes(searchTerm)
    );
  }, [messages, query]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setCurrentIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "Enter" && results.length > 0) {
        onResultSelect(results[currentIndex].id);
      } else if (e.key === "ArrowDown" && results.length > 0) {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp" && results.length > 0) {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    },
    [results, currentIndex, onResultSelect, handleClose]
  );

  // Navigate to current result when index changes
  useEffect(() => {
    if (results.length > 0 && results[currentIndex]) {
      onResultSelect(results[currentIndex].id);
    }
  }, [currentIndex, results, onResultSelect]);

  const goToNext = useCallback(() => {
    if (results.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }
  }, [results.length]);

  const goToPrevious = useCallback(() => {
    if (results.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  }, [results.length]);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (isOpen) {
          inputRef.current?.focus();
        } else {
          handleOpen();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, handleOpen]);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className={cn("gap-2 text-muted-foreground", className)}
        aria-label="Search messages (Ctrl+F)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Search</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60">
          ⌘F
        </kbd>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg animate-fade-in",
        className
      )}
      role="search"
      aria-label="Search messages"
    >
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search messages..."
          className="pl-9 pr-2 h-8 text-sm"
          aria-label="Search query"
          aria-describedby="search-results-count"
        />
      </div>

      {query.length >= 2 && (
        <div className="flex items-center gap-1">
          <span
            id="search-results-count"
            className="text-xs text-muted-foreground whitespace-nowrap"
          >
            {results.length === 0 ? (
              "No results"
            ) : (
              <>
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {currentIndex + 1}/{results.length}
                </Badge>
              </>
            )}
          </span>

          {results.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={goToPrevious}
                aria-label="Previous result"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={goToNext}
                aria-label="Next result"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleClose}
        aria-label="Close search"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Compact search results dropdown for showing matches
interface SearchResultsDropdownProps {
  results: Message[];
  currentIndex: number;
  onSelect: (index: number) => void;
  query: string;
}

export function SearchResultsDropdown({
  results,
  currentIndex,
  onSelect,
  query,
}: SearchResultsDropdownProps) {
  if (results.length === 0) return null;

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300/50 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50">
      {results.slice(0, 5).map((result, index) => (
        <button
          key={result.id}
          onClick={() => onSelect(index)}
          className={cn(
            "w-full p-2 text-left hover:bg-muted/50 transition-colors flex items-start gap-2",
            index === currentIndex && "bg-muted"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant={result.role === "user" ? "default" : "secondary"} className="text-[10px] px-1 py-0">
                {result.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {highlightMatch(result.content.slice(0, 100), query)}
              {result.content.length > 100 && "..."}
            </p>
          </div>
        </button>
      ))}
      {results.length > 5 && (
        <div className="p-2 text-center text-xs text-muted-foreground border-t">
          +{results.length - 5} more results
        </div>
      )}
    </div>
  );
}
