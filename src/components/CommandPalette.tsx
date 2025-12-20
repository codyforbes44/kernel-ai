import { useState } from "react";
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

  // Open Builder with Cmd+Shift+B
  useShortcut("b", () => {
    navigate("/builder");
  }, {
    meta: true,
    shift: true,
    description: "Open App Builder",
  });

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          aria-label="Search commands"
        />
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
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>New Conversation</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => createProject("New Project"))}
            >
              <FolderPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>New Project</span>
              <CommandShortcut>⌘⇧N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/builder"))}
            >
              <Code2 className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Open App Builder</span>
              <CommandShortcut>⌘⇧B</CommandShortcut>
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
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => runCommand(() => setCurrentProject(project))}
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
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setShortcutsOpen(true))}>
              <Keyboard className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Keyboard Shortcuts</span>
              <CommandShortcut>⌘⇧/</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Help */}
          <CommandGroup heading="Help">
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <GraduationCap className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Take the Tour</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => window.open("https://docs.lovable.dev", "_blank"))}
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Documentation</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => window.open("https://discord.com/channels/1119885301872070706/1280461670979993613", "_blank"))}
            >
              <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Community Support</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Account */}
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(signOut)}>
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
