import { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { KeyboardShortcutsModal } from "@/components/dialogs/KeyboardShortcutsModal";

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
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

  // Toggle theme with Cmd+D
  useShortcut("d", () => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, {
    meta: true,
    description: "Toggle dark mode",
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

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (currentProject) createConversation(currentProject.id);
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New Conversation</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => createProject("New Project"))}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New Project</span>
              <CommandShortcut>⌘⇧N</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <>
              <CommandGroup heading="Recent Conversations">
                {conversations.slice(0, 5).map((conversation) => (
                  <CommandItem
                    key={conversation.id}
                    onSelect={() =>
                      runCommand(() => setCurrentConversation(conversation))
                    }
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
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
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => runCommand(() => setCurrentProject(project))}
                  >
                    <span className="mr-2">{project.icon || "📁"}</span>
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
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setShortcutsOpen(true))}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>⌘⇧/</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Account */}
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(signOut)}>
              <LogOut className="mr-2 h-4 w-4" />
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
