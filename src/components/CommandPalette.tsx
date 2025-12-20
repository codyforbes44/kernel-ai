import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";
import {
  MessageSquare,
  Plus,
  FolderPlus,
  Settings,
  Moon,
  Sun,
  LogOut,
  Keyboard,
  Code2,
  HelpCircle,
  GraduationCap,
  ExternalLink,
  Clock,
  Star,
  Search,
  Sparkles,
  FileText,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { KeyboardShortcutsModal } from "@/components/dialogs/KeyboardShortcutsModal";
import { cn } from "@/lib/utils";

// Store recent commands in localStorage
const RECENT_COMMANDS_KEY = "recent-commands";
const MAX_RECENT_COMMANDS = 5;

interface RecentCommand {
  id: string;
  label: string;
  timestamp: number;
}

function getRecentCommands(): RecentCommand[] {
  try {
    const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentCommand(id: string, label: string) {
  const recent = getRecentCommands().filter(c => c.id !== id);
  recent.unshift({ id, label, timestamp: Date.now() });
  localStorage.setItem(
    RECENT_COMMANDS_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT_COMMANDS))
  );
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [recentCommands, setRecentCommands] = useState<RecentCommand[]>([]);
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const {
    projects,
    conversations,
    currentProject,
    setCurrentProject,
    setCurrentConversation,
    createProject,
    createConversation,
  } = useWorkspace();

  // Load recent commands when opening
  useEffect(() => {
    if (open) {
      setRecentCommands(getRecentCommands());
    }
  }, [open]);

  // Open command palette with Cmd+K
  useShortcut("k", () => setOpen(true), {
    meta: true,
    description: "Open command palette",
  });

  // New conversation with Cmd+N
  useShortcut("n", () => {
    if (currentProject) {
      createConversation(currentProject.id);
    }
  }, {
    meta: true,
    description: "New conversation",
  });

  // New project with Cmd+Shift+N
  useShortcut("n", () => {
    createProject("New Project");
  }, {
    meta: true,
    shift: true,
    description: "New project",
  });

  // Toggle theme with Cmd+D (cycles: dark → oled → light → dark)
  useShortcut("d", () => {
    const themeOrder = ["dark", "oled", "light"];
    const currentIndex = themeOrder.indexOf(theme || "dark");
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  }, {
    meta: true,
    description: "Cycle theme",
  });

  // Open settings with Cmd+,
  useShortcut(",", () => {
    navigate("/settings");
  }, {
    meta: true,
    description: "Open settings",
  });

  // Open keyboard shortcuts with Cmd+?
  useShortcut("/", () => {
    setShortcutsOpen(true);
  }, {
    meta: true,
    shift: true,
    description: "Show keyboard shortcuts",
  });

  // Open Builder with Cmd+Shift+B
  useShortcut("b", () => {
    navigate("/builder");
  }, {
    meta: true,
    shift: true,
    description: "Open App Builder",
  });

  const runCommand = (command: () => void, id: string, label: string) => {
    setOpen(false);
    addRecentCommand(id, label);
    command();
  };

  // Pinned conversations for quick access
  const pinnedConversations = useMemo(() => 
    conversations.filter(c => c.is_pinned).slice(0, 3),
    [conversations]
  );

  // Recent conversations (excluding pinned)
  const recentConversations = useMemo(() => 
    conversations
      .filter(c => !c.is_pinned)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5),
    [conversations]
  );

  // Map recent command IDs to actions
  const commandActions: Record<string, { action: () => void; icon: React.ReactNode }> = {
    "new-conversation": {
      action: () => currentProject && createConversation(currentProject.id),
      icon: <Plus className="h-4 w-4" />,
    },
    "new-project": {
      action: () => createProject("New Project"),
      icon: <FolderPlus className="h-4 w-4" />,
    },
    "open-builder": {
      action: () => navigate("/builder"),
      icon: <Code2 className="h-4 w-4" />,
    },
    "toggle-theme": {
      action: () => {
        const themeOrder = ["dark", "oled", "light"];
        const currentIndex = themeOrder.indexOf(theme || "dark");
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        setTheme(themeOrder[nextIndex]);
      },
      icon: theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
    },
    "open-settings": {
      action: () => navigate("/settings"),
      icon: <Settings className="h-4 w-4" />,
    },
    "keyboard-shortcuts": {
      action: () => setShortcutsOpen(true),
      icon: <Keyboard className="h-4 w-4" />,
    },
    "sign-out": {
      action: signOut,
      icon: <LogOut className="h-4 w-4" />,
    },
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          aria-label="Search commands"
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search term or create something new
              </p>
            </div>
          </CommandEmpty>

          {/* Recent Commands */}
          {recentCommands.length > 0 && (
            <>
              <CommandGroup heading="Recent">
                {recentCommands.map((recent) => {
                  const cmd = commandActions[recent.id];
                  if (!cmd) return null;
                  return (
                    <CommandItem
                      key={recent.id}
                      onSelect={() => runCommand(cmd.action, recent.id, recent.label)}
                      className="gap-2"
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                      {cmd.icon}
                      <span>{recent.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() =>
                runCommand(
                  () => currentProject && createConversation(currentProject.id),
                  "new-conversation",
                  "New Conversation"
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>New Conversation</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(
                () => createProject("New Project"),
                "new-project",
                "New Project"
              )}
            >
              <FolderPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>New Project</span>
              <CommandShortcut>⌘⇧N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(
                () => navigate("/builder"),
                "open-builder",
                "Open App Builder"
              )}
            >
              <Code2 className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Open App Builder</span>
              <CommandShortcut>⌘⇧B</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Pinned Conversations */}
          {pinnedConversations.length > 0 && (
            <>
              <CommandGroup heading="Pinned">
                {pinnedConversations.map((conversation) => (
                  <CommandItem
                    key={conversation.id}
                    onSelect={() =>
                      runCommand(
                        () => setCurrentConversation(conversation),
                        `conversation-${conversation.id}`,
                        conversation.title
                      )
                    }
                    className="gap-2"
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                    <span className="truncate">{conversation.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Recent Conversations */}
          {recentConversations.length > 0 && (
            <>
              <CommandGroup heading="Recent Conversations">
                {recentConversations.map((conversation) => (
                  <CommandItem
                    key={conversation.id}
                    onSelect={() =>
                      runCommand(
                        () => setCurrentConversation(conversation),
                        `conversation-${conversation.id}`,
                        conversation.title
                      )
                    }
                  >
                    <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span className="truncate">{conversation.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <>
              <CommandGroup heading="Projects">
                {projects.slice(0, 5).map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => runCommand(
                      () => setCurrentProject(project),
                      `project-${project.id}`,
                      project.name
                    )}
                  >
                    <span className="mr-2" aria-hidden="true">{project.icon || "📁"}</span>
                    <span>{project.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Settings */}
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                const themeOrder = ["dark", "oled", "light"];
                const currentIndex = themeOrder.indexOf(theme || "dark");
                const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
                const nextLabel = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
                runCommand(
                  () => setTheme(nextTheme),
                  "toggle-theme",
                  `Switch to ${nextLabel} Mode`
                );
              }}
            >
              {theme === "light" ? (
                <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span>Cycle Theme ({theme === "dark" ? "→ OLED" : theme === "oled" ? "→ Light" : "→ Dark"})</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => setShortcutsOpen(true),
              "keyboard-shortcuts",
              "Keyboard Shortcuts"
            )}>
              <Keyboard className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>⌘⇧/</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(
              () => navigate("/settings"),
              "open-settings",
              "Settings"
            )}>
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Help */}
          <CommandGroup heading="Help & Resources">
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"), "take-tour", "Take the Tour")}>
              <GraduationCap className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Take the Tour</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => window.open("https://docs.lovable.dev", "_blank"), "documentation", "Documentation")}
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Documentation</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => window.open("https://discord.com/channels/1119885301872070706/1280461670979993613", "_blank"), "community", "Community Support")}
            >
              <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Community Support</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Account */}
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(signOut, "sign-out", "Sign Out")}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
