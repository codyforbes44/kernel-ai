export interface TechStackItem {
  id: string;
  name: string;
  version?: string;
  notes?: string;
}

export interface CodeConventions {
  componentNaming: string;
  fileNaming: string;
  stateManagement: string;
  styling: string;
  customRules: string[];
}

export interface ContextDocument {
  id: string;
  title: string;
  content: string;
  type: 'reference' | 'example' | 'api-doc';
}

export interface KnowledgeBase {
  instructions: string;
  techStack: TechStackItem[];
  conventions: CodeConventions;
  contextDocs: ContextDocument[];
  lastUpdated: string;
}

export const defaultKnowledgeBase: KnowledgeBase = {
  instructions: '',
  techStack: [],
  conventions: {
    componentNaming: '',
    fileNaming: '',
    stateManagement: '',
    styling: '',
    customRules: [],
  },
  contextDocs: [],
  lastUpdated: new Date().toISOString(),
};

// Helper to format knowledge base for AI prompt
export function formatKnowledgeBaseForPrompt(kb: KnowledgeBase): string {
  const sections: string[] = [];

  if (kb.instructions.trim()) {
    sections.push(`CUSTOM INSTRUCTIONS:\n${kb.instructions}`);
  }

  if (kb.techStack.length > 0) {
    const techList = kb.techStack
      .map(t => `- ${t.name}${t.version ? ` v${t.version}` : ''}${t.notes ? ` (${t.notes})` : ''}`)
      .join('\n');
    sections.push(`TECH STACK:\n${techList}`);
  }

  const { componentNaming, fileNaming, stateManagement, styling, customRules } = kb.conventions;
  const conventions: string[] = [];
  if (componentNaming) conventions.push(`- Components: ${componentNaming}`);
  if (fileNaming) conventions.push(`- Files: ${fileNaming}`);
  if (stateManagement) conventions.push(`- State: ${stateManagement}`);
  if (styling) conventions.push(`- Styling: ${styling}`);
  if (customRules.length > 0) {
    customRules.forEach(rule => conventions.push(`- ${rule}`));
  }
  if (conventions.length > 0) {
    sections.push(`CODE CONVENTIONS:\n${conventions.join('\n')}`);
  }

  if (kb.contextDocs.length > 0) {
    const docs = kb.contextDocs
      .map(d => `[${d.type.toUpperCase()}: ${d.title}]\n${d.content}`)
      .join('\n\n');
    sections.push(`REFERENCE DOCUMENTS:\n${docs}`);
  }

  if (sections.length === 0) {
    return '';
  }

  return `
=== PROJECT-SPECIFIC CONTEXT ===

${sections.join('\n\n')}

=== END PROJECT CONTEXT ===
`;
}
