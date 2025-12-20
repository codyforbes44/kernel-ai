import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Square,
  Paperclip,
  Command,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";
import { useTemplateInjection } from "@/hooks/useTemplateInjection";
import { templateService } from "@/services/templateService";
import { TemplatePicker } from "./TemplatePicker";
import { FilePreview } from "./FilePreview";
import { TemplateVariablesDialog } from "@/components/dialogs/TemplateVariablesDialog";
import { useFileUpload, type UploadedFile } from "@/hooks/useFileUpload";
import type { PromptTemplate } from "@/types/database";

interface ChatInputProps {
  onSend: (message: string, attachments?: UploadedFile[]) => void;
  isLoading: boolean;
  onStop: () => void;
  disabled?: boolean;
  initialValue?: string;
  onInitialValueConsumed?: () => void;
  isMobile?: boolean;
}

export function ChatInput({
  onSend,
  isLoading,
  onStop,
  disabled,
  initialValue,
  onInitialValueConsumed,
  isMobile,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [variablesDialogOpen, setVariablesDialogOpen] = useState(false);
  const [pendingTemplateContent, setPendingTemplateContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const { uploadFiles, isUploading, deleteFile, allowedTypes } = useFileUpload();
  const { pendingTemplate, pendingVariables, consumeTemplate, clearPending } = useTemplateInjection();

  // Handle pending template from sidebar
  useEffect(() => {
    if (pendingTemplate) {
      const variables = templateService.extractVariables(pendingTemplate);
      if (variables.length > 0) {
        // Show variables dialog
        setPendingTemplateContent(pendingTemplate);
        setVariablesDialogOpen(true);
      } else {
        // No variables, insert directly
        setMessage(pendingTemplate);
        textareaRef.current?.focus();
      }
      consumeTemplate();
    }
  }, [pendingTemplate, consumeTemplate]);

  // Handle initial value for edit & resend
  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
      onInitialValueConsumed?.();
      textareaRef.current?.focus();
      // Move cursor to end
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        }
      }, 0);
    }
  }, [initialValue, onInitialValueConsumed]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle / command for templates
  useEffect(() => {
    if (message.startsWith("/")) {
      setShowTemplates(true);
      setTemplateSearch(message.slice(1));
    } else {
      setShowTemplates(false);
      setTemplateSearch("");
    }
  }, [message]);

  const handleSubmit = () => {
    if ((!message.trim() && attachedFiles.length === 0) || isLoading || disabled || isUploading) return;
    onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setMessage("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't interfere with IME composition (for Chinese, Japanese, Korean input)
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && showTemplates) {
      e.preventDefault();
      setShowTemplates(false);
      setMessage("");
    }
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    const variables = templateService.extractVariables(template.content);
    if (variables.length > 0) {
      // Show variables dialog
      setPendingTemplateContent(template.content);
      setVariablesDialogOpen(true);
      setShowTemplates(false);
    } else {
      // No variables, insert directly
      setMessage(template.content);
      setShowTemplates(false);
      textareaRef.current?.focus();
    }
  };

  const handleVariablesApply = (content: string) => {
    setMessage(content);
    setPendingTemplateContent("");
    textareaRef.current?.focus();
  };

  const openTemplatePicker = () => {
    setMessage("/");
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploaded = await uploadFiles(files);
    setAttachedFiles((prev) => [...prev, ...uploaded]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    textareaRef.current?.focus();
  };

  const handleRemoveFile = async (index: number) => {
    const file = attachedFiles[index];
    await deleteFile(file.path);
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const uploaded = await uploadFiles(files);
    setAttachedFiles((prev) => [...prev, ...uploaded]);
    textareaRef.current?.focus();
  }, [disabled, isUploading, uploadFiles]);

  // Clipboard paste handler for images
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (disabled || isUploading) return;

    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length === 0) return;

    // Prevent default paste behavior for images
    e.preventDefault();

    const files: File[] = [];
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (file) {
        // Create a new file with a proper name since clipboard images don't have names
        const extension = file.type.split('/')[1] || 'png';
        const namedFile = new File([file], `pasted-image-${Date.now()}.${extension}`, {
          type: file.type,
        });
        files.push(namedFile);
      }
    }

    if (files.length > 0) {
      const uploaded = await uploadFiles(files);
      setAttachedFiles((prev) => [...prev, ...uploaded]);
    }
  }, [disabled, isUploading, uploadFiles]);

  // Global shortcut to focus input
  useShortcut("l", () => textareaRef.current?.focus(), {
    meta: true,
    description: "Focus chat input",
  });

  // Shortcut to open template picker - only when not in any input field
  useShortcut("/", () => {
    const active = document.activeElement as HTMLElement;
    const isInInputField = active?.tagName === 'INPUT' || 
                           active?.tagName === 'TEXTAREA' || 
                           active?.isContentEditable;
    if (!isInInputField) {
      openTemplatePicker();
    }
  }, {
    description: "Open template picker",
  });

  return (
    <div className="relative">
      {showTemplates && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => {
            setShowTemplates(false);
            setMessage("");
          }}
          searchQuery={templateSearch}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border border-border/50 bg-card/50 backdrop-blur",
          "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
          "transition-all duration-200",
          disabled && "opacity-50",
          isDragOver && "border-primary border-dashed bg-primary/5"
        )}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-primary/10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-8 w-8 animate-bounce" />
              <span className="text-sm font-medium">Drop files here</span>
            </div>
          </div>
        )}

        {/* File preview */}
        {attachedFiles.length > 0 && (
          <FilePreview
            files={attachedFiles}
            onRemove={handleRemoveFile}
            className="border-b border-border/50"
          />
        )}

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            disabled
              ? "Select a conversation to start chatting..."
              : isMobile
                ? "Ask me anything..."
                : "Ask me anything... (⌘V to paste images, drag files, / for templates)"
          }
          disabled={disabled || isLoading || isUploading}
          className={cn(
            "min-h-[52px] md:min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "pr-24 py-3 md:py-4 px-3 md:px-4",
            "text-[16px] md:text-sm", // 16px on mobile prevents iOS zoom
            "touch-manipulation"
          )}
          rows={1}
          aria-label="Message input"
          aria-describedby="chat-input-help"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-0.5 md:gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 md:h-8 md:w-8 text-muted-foreground hover:text-foreground",
                  "touch-manipulation active:scale-95",
                  attachedFiles.length > 0 && "text-primary"
                )}
                disabled={disabled || isUploading}
                onClick={openFileDialog}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isUploading ? "Uploading..." : "Attach file (images, PDF, text)"}
            </TooltipContent>
          </Tooltip>

          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 md:h-8 md:w-8 text-muted-foreground hover:text-foreground",
                    "touch-manipulation active:scale-95",
                    showTemplates && "bg-primary/10 text-primary"
                  )}
                  disabled={disabled}
                  onClick={openTemplatePicker}
                >
                  <Command className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert template (/)</TooltipContent>
            </Tooltip>
          )}

          {isLoading ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 md:h-8 md:w-8 touch-manipulation active:scale-95"
                  onClick={onStop}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop generating (Esc)</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="h-9 w-9 md:h-8 md:w-8 touch-manipulation active:scale-95"
                  onClick={handleSubmit}
                  disabled={(!message.trim() && attachedFiles.length === 0) || disabled || showTemplates || isUploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message {isMobile ? "" : "(⌘Enter)"}</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Character count - hide on mobile */}
        {message.length > 0 && !showTemplates && !isMobile && (
          <div className="absolute left-4 bottom-2 text-xs text-muted-foreground">
            {message.length} chars
          </div>
        )}
      </div>

      {/* Template Variables Dialog */}
      <TemplateVariablesDialog
        open={variablesDialogOpen}
        onOpenChange={(open) => {
          setVariablesDialogOpen(open);
          if (!open) setPendingTemplateContent("");
        }}
        templateContent={pendingTemplateContent}
        onApply={handleVariablesApply}
      />
    </div>
  );
}
