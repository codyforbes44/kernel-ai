import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format as formatDate } from 'date-fns';
import { jsPDF } from 'jspdf';
import { companionService } from '@/services/companionService';
import type { CompanionProfile, CompanionConversation, CompanionRelationship } from '@/types/companion';

interface ConversationExporterProps {
  companion: CompanionProfile;
  relationship: CompanionRelationship;
  conversations: CompanionConversation[];
}

type ExportFormat = 'pdf' | 'markdown' | 'json';

export function ConversationExporter({ companion, relationship, conversations }: ConversationExporterProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [selectedConversation, setSelectedConversation] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Get messages for selected conversation(s)
      let allMessages: { conversationTitle: string; messages: any[] }[] = [];

      if (selectedConversation === 'all') {
        for (const conv of conversations) {
          const messages = await companionService.getMessages(conv.id);
          allMessages.push({ conversationTitle: conv.title, messages });
        }
      } else {
        const conv = conversations.find(c => c.id === selectedConversation);
        if (conv) {
          const messages = await companionService.getMessages(conv.id);
          allMessages.push({ conversationTitle: conv.title, messages });
        }
      }

      if (allMessages.length === 0) {
        toast.error('No messages to export');
        return;
      }

      switch (format) {
        case 'pdf':
          exportAsPDF(allMessages);
          break;
        case 'markdown':
          exportAsMarkdown(allMessages);
          break;
        case 'json':
          exportAsJSON(allMessages);
          break;
      }

      toast.success('Export complete', { description: `Conversations exported as ${format.toUpperCase()}` });
    } catch (error) {
      toast.error('Export failed', { description: (error as Error).message });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = (conversationData: { conversationTitle: string; messages: any[] }[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFontSize(20);
    doc.text(`Conversations with ${companion.name}`, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Exported on ${formatDate(new Date(), 'PPpp')}`, margin, y);
    doc.text(`Affinity Level: ${relationship.affinity_level}/100`, margin, y + 5);
    y += 20;

    doc.setTextColor(0);

    for (const { conversationTitle, messages } of conversationData) {
      // Check for new page
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = margin;
      }

      // Conversation header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(conversationTitle || 'Conversation', margin, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      for (const message of messages) {
        if (y > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          y = margin;
        }

        const sender = message.role === 'user' ? 'You' : companion.name;
        const timestamp = formatDate(new Date(message.created_at), 'Pp');
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${sender} (${timestamp}):`, margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(message.content, maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;
      }

      y += 10;
    }

    doc.save(`${companion.name.toLowerCase()}-conversations.pdf`);
  };

  const exportAsMarkdown = (conversationData: { conversationTitle: string; messages: any[] }[]) => {
    let markdown = `# Conversations with ${companion.name}\n\n`;
    markdown += `*Exported on ${formatDate(new Date(), 'PPpp')}*\n`;
    markdown += `*Affinity Level: ${relationship.affinity_level}/100*\n\n`;
    markdown += `---\n\n`;

    for (const { conversationTitle, messages } of conversationData) {
      markdown += `## ${conversationTitle || 'Conversation'}\n\n`;

      for (const message of messages) {
        const sender = message.role === 'user' ? 'You' : companion.name;
        const timestamp = formatDate(new Date(message.created_at), 'Pp');
        
        markdown += `### ${sender}\n`;
        markdown += `*${timestamp}*\n\n`;
        markdown += `${message.content}\n\n`;
      }

      markdown += `---\n\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companion.name.toLowerCase()}-conversations.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = (conversationData: { conversationTitle: string; messages: any[] }[]) => {
    const exportData = {
      companion: {
        name: companion.name,
        personality_type: companion.personality_type,
      },
      relationship: {
        affinity_level: relationship.affinity_level,
        total_messages: relationship.total_messages,
        created_at: relationship.created_at,
      },
      exported_at: new Date().toISOString(),
      conversations: conversationData.map(({ conversationTitle, messages }) => ({
        title: conversationTitle,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          emotion_tags: m.emotion_tags,
          timestamp: m.created_at,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companion.name.toLowerCase()}-conversations.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Conversations
        </CardTitle>
        <CardDescription>
          Download your conversation history with {companion.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {/* Conversation Selection */}
        <div className="space-y-2">
          <Label>Select Conversation</Label>
          <Select value={selectedConversation} onValueChange={setSelectedConversation}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a conversation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conversations ({conversations.length})</SelectItem>
              {conversations.map(conv => (
                <SelectItem key={conv.id} value={conv.id}>
                  {conv.title || 'Untitled'} ({conv.message_count} messages)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <Label>Export Format</Label>
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <motion.div 
              className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex-1 cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">PDF Document</p>
                  <p className="text-xs text-muted-foreground">Formatted document for printing or sharing</p>
                </div>
              </Label>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <RadioGroupItem value="markdown" id="markdown" />
              <Label htmlFor="markdown" className="flex-1 cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">Markdown</p>
                  <p className="text-xs text-muted-foreground">Plain text with formatting for developers</p>
                </div>
              </Label>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex-1 cursor-pointer flex items-center gap-2">
                <FileJson className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium">JSON Data</p>
                  <p className="text-xs text-muted-foreground">Structured data for analysis or import</p>
                </div>
              </Label>
            </motion.div>
          </RadioGroup>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting || conversations.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {selectedConversation === 'all' ? 'All Conversations' : 'Selected Conversation'}
            </>
          )}
        </Button>

        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No conversations to export yet. Start chatting with {companion.name}!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
