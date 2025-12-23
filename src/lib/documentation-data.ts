import { 
  Rocket, 
  Code, 
  Database, 
  Shield, 
  Zap,
  Palette,
  GitBranch,
  Cloud,
  LucideIcon
} from 'lucide-react';

// ============= Type Definitions =============

export interface DocSection {
  title: string;
  content: string;
  codeExample?: {
    language: string;
    code: string;
    filename?: string;
  };
  tip?: string;
  warning?: string;
  note?: string;
}

export interface DocArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  icon: LucideIcon;
  readTime: string;
  lastUpdated: string;
  sections: DocSection[];
  relatedDocs?: string[];
}

export interface DocCategory {
  title: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  articles: DocArticle[];
}

// ============= Documentation Content =============

const gettingStartedArticles: DocArticle[] = [
  {
    id: 'gs-1',
    slug: 'quick-start-guide',
    title: 'Quick Start Guide',
    description: 'Get up and running with Kernel in under 5 minutes. Create your account, understand the interface, and deploy your first app.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    icon: Rocket,
    readTime: '5 min',
    lastUpdated: '2024-01-15',
    sections: [
      {
        title: 'Welcome to Kernel',
        content: `Kernel is an AI-powered development platform that helps you build beautiful web applications faster than ever. Whether you're a seasoned developer or just starting out, Kernel's intelligent assistant and visual tools make app development accessible to everyone.

In this guide, you'll learn how to:
- Create your Kernel account
- Navigate the main interface
- Build your first component with AI assistance
- Deploy your application to the web`,
      },
      {
        title: 'Creating Your Account',
        content: `Getting started with Kernel is simple. Visit our homepage and click the \"Get Started\" button. You can sign up using:

- **Email and password** - Traditional signup with email verification
- **Google OAuth** - One-click signup with your Google account
- **GitHub OAuth** - Perfect for developers who want to sync their repos

After signing up, you'll be guided through a brief onboarding flow that helps us understand your goals and customize your experience.`,
        tip: 'Using GitHub OAuth enables seamless integration with your existing repositories and allows for automatic code syncing.',
      },
      {
        title: 'Understanding the Interface',
        content: `The Kernel interface is designed for productivity. Here's a quick overview of the main areas:

**Left Sidebar** - Navigation between projects, conversations, and settings
**Main Canvas** - Where you build and preview your application
**AI Chat Panel** - Your AI assistant for code generation and help
**Top Toolbar** - Quick actions like deploy, share, and settings

The interface adapts based on your current context. When building, you'll see code editing tools. When designing, you'll get visual editing capabilities.`,
        codeExample: {
          language: 'bash',
          code: `# Keyboard shortcuts to remember
Ctrl/Cmd + K - Open command palette
Ctrl/Cmd + S - Save current file
Ctrl/Cmd + P - Quick file search
Ctrl/Cmd + / - Toggle comment`,
          filename: 'shortcuts.txt'
        }
      },
      {
        title: 'Building Your First Component',
        content: `Let's create a simple component using AI assistance. In the chat panel, try typing:

\"Create a hero section with a heading, description, and call-to-action button\"

The AI will generate a complete, styled component that you can:
- Preview instantly in the live preview panel
- Edit the code directly in the editor
- Customize with additional prompts
- Deploy to production`,
        codeExample: {
          language: 'tsx',
          code: `// AI-generated Hero component
const Hero = () => {
  return (
    <section className="py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to My App
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        Build amazing things with AI assistance.
      </p>
      <Button size="lg">Get Started</Button>
    </section>
  );
};`,
          filename: 'Hero.tsx'
        }
      },
      {
        title: 'Deploying Your App',
        content: `Ready to share your creation with the world? Kernel makes deployment as simple as clicking a button.

1. Click the **Publish** button in the top right corner
2. Choose your deployment environment (staging or production)
3. Optionally add a custom domain
4. Click **Deploy** and watch your app go live!

Your app will be available at a unique URL like \`your-app.kernel.cool\`. You can share this link immediately or configure a custom domain in settings.`,
        tip: 'Frontend changes require clicking \"Update\" to deploy, but backend changes (database, edge functions) deploy automatically.',
      }
    ],
    relatedDocs: ['gs-2', 'gs-3', 'ab-1']
  },
  {
    id: 'gs-2',
    slug: 'creating-your-first-project',
    title: 'Creating Your First Project',
    description: 'Learn how to create a new project from scratch or use templates to jumpstart your development.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    icon: Rocket,
    readTime: '8 min',
    lastUpdated: '2024-01-14',
    sections: [
      {
        title: 'Project Creation Options',
        content: `Kernel offers multiple ways to start a new project based on your needs:

**Blank Project** - Start with a minimal setup and build from scratch
**Templates** - Choose from pre-built templates for common app types
**Import from GitHub** - Bring an existing project into Kernel
**Clone a Public Project** - Remix someone else's creation

Each option has its advantages. Blank projects give you full control, while templates provide proven patterns and designs to build upon.`,
      },
      {
        title: 'Using Templates',
        content: `Templates are the fastest way to get started with a polished foundation. We offer templates for:

- **Landing Pages** - Marketing sites with hero sections, features, and CTAs
- **Dashboards** - Admin panels with charts, tables, and data visualization
- **E-commerce** - Product listings, carts, and checkout flows
- **SaaS Starter** - Authentication, pricing pages, and user management
- **Blog/Portfolio** - Content-focused sites with clean typography

To use a template:
1. Click \"New Project\" in the sidebar
2. Browse the template gallery
3. Preview any template before selecting
4. Click \"Use Template\" to create your project`,
        tip: 'Templates can be customized extensively. Use them as a starting point and let the AI help you transform them into your unique vision.',
      },
      {
        title: 'Project Settings',
        content: `After creating your project, configure essential settings:

**Project Name** - A descriptive name for your project
**Description** - Brief summary of what you're building
**Visibility** - Public (anyone can view) or Private
**Framework** - React is the default and recommended choice

You can access these settings anytime by clicking the project name in the header and selecting \"Settings\".`,
        codeExample: {
          language: 'json',
          code: `{
  "name": "My Awesome App",
  "description": "A productivity tool built with AI",
  "framework": "react",
  "visibility": "private",
  "settings": {
    "theme": "dark",
    "autoSave": true
  }
}`,
          filename: 'project.json'
        }
      },
      {
        title: 'Understanding File Structure',
        content: `Every Kernel project follows a clean, organized structure:

\`\`\`
src/
├── components/     # Reusable UI components
│   └── ui/        # Base UI components (Button, Card, etc.)
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and helpers
├── types/         # TypeScript definitions
└── App.tsx        # Main application component
\`\`\`

This structure promotes code organization and makes it easy to find and modify components. The AI understands this structure and places generated code in appropriate locations.`,
        note: 'You can customize this structure, but sticking to conventions makes AI assistance more effective.',
      },
      {
        title: 'Next Steps',
        content: `Now that your project is set up, you're ready to start building! Here's what to explore next:

1. **Chat with the AI** - Describe what you want to build
2. **Explore the file tree** - Understand the generated code
3. **Use the preview** - See your changes in real-time
4. **Connect a database** - Add persistence to your app
5. **Deploy** - Share your creation with the world

The AI is your partner throughout this journey. Don't hesitate to ask questions, request changes, or explore new ideas.`,
      }
    ],
    relatedDocs: ['gs-1', 'gs-3', 'comp-1']
  },
  {
    id: 'gs-3',
    slug: 'understanding-the-interface',
    title: 'Understanding the Interface',
    description: 'A comprehensive tour of the Kernel interface, including panels, shortcuts, and productivity features.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    icon: Rocket,
    readTime: '10 min',
    lastUpdated: '2024-01-13',
    sections: [
      {
        title: 'Interface Overview',
        content: `The Kernel interface is thoughtfully designed to maximize your productivity. It's divided into several key areas that work together seamlessly.

**The layout automatically adapts** based on your screen size and current task. On desktop, you'll see the full experience. On tablet and mobile, panels collapse into a more focused view.`,
      },
      {
        title: 'The Sidebar',
        content: `The left sidebar is your project navigation hub:

**Projects** - Switch between your projects or create new ones
**Conversations** - View chat history with the AI assistant
**Templates** - Access saved templates and prompts
**Settings** - Configure your account and preferences

You can collapse the sidebar by clicking the hamburger menu or pressing \`Ctrl/Cmd + B\` to gain more screen space when needed.`,
      },
      {
        title: 'The Code Editor',
        content: `Our Monaco-based code editor provides a professional development experience:

- **Syntax highlighting** for TypeScript, JavaScript, CSS, and more
- **IntelliSense** with autocomplete and type hints
- **Multi-cursor editing** for efficient code changes
- **Integrated terminal** for running commands
- **Git integration** for version control

The editor syncs with AI suggestions in real-time. When the AI generates code, you'll see it appear directly in the relevant files.`,
        codeExample: {
          language: 'tsx',
          code: `// Editor supports full TypeScript
interface UserProps {
  name: string;
  email: string;
  avatar?: string;
}

const UserCard = ({ name, email, avatar }: UserProps) => {
  return (
    <Card>
      <Avatar src={avatar} fallback={name[0]} />
      <h3>{name}</h3>
      <p>{email}</p>
    </Card>
  );
};`,
          filename: 'UserCard.tsx'
        }
      },
      {
        title: 'The AI Chat Panel',
        content: `The chat panel on the right is where you interact with your AI assistant. It's designed for natural conversation about your project.

**Features:**
- **Context-aware** - The AI knows about your project structure
- **File attachments** - Share images or designs for reference
- **Code blocks** - Properly formatted code in responses
- **History** - Scroll back through previous conversations

**Tips for effective prompting:**
- Be specific about what you want
- Mention file names when relevant
- Describe visual designs in detail
- Ask follow-up questions to refine`,
        tip: 'Start prompts with action verbs like \"Create\", \"Update\", \"Fix\", or \"Add\" for clearer intent.',
      },
      {
        title: 'The Preview Panel',
        content: `The live preview shows your application as it will appear to users. It updates in real-time as you make changes.

**Preview features:**
- **Hot reload** - See changes instantly
- **Responsive testing** - Toggle between device sizes
- **Zoom controls** - Focus on specific areas
- **Console access** - Debug JavaScript issues

You can also access the preview in a new tab for a full-screen experience.`,
      },
      {
        title: 'Keyboard Shortcuts',
        content: `Master these shortcuts to work faster:`,
        codeExample: {
          language: 'markdown',
          code: `| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + K | Command palette |
| Ctrl/Cmd + S | Save file |
| Ctrl/Cmd + P | Quick file search |
| Ctrl/Cmd + B | Toggle sidebar |
| Ctrl/Cmd + / | Toggle comment |
| Ctrl/Cmd + D | Duplicate line |
| Ctrl/Cmd + Shift + P | Open settings |
| F5 | Refresh preview |`,
          filename: 'shortcuts.md'
        }
      },
      {
        title: 'Command Palette',
        content: `Press \`Ctrl/Cmd + K\` to open the command palette - a powerful tool for quick navigation and actions.

From the command palette, you can:
- Search and open any file
- Run project commands
- Toggle settings
- Access documentation
- Switch themes
- Navigate to specific lines

Start typing to filter commands, then press Enter to execute.`,
        note: 'The command palette learns from your usage and surfaces frequently used commands first.',
      }
    ],
    relatedDocs: ['gs-1', 'gs-2', 'ab-1']
  }
];

const aiBuilderArticles: DocArticle[] = [
  {
    id: 'ab-1',
    slug: 'ai-powered-development',
    title: 'AI-Powered Development',
    description: 'Understand how Kernel\'s AI assistant works and how to leverage it for maximum productivity.',
    category: 'AI Builder',
    categorySlug: 'ai-builder',
    icon: Zap,
    readTime: '12 min',
    lastUpdated: '2024-01-12',
    sections: [
      {
        title: 'How AI Assistance Works',
        content: `Kernel's AI is designed to be your intelligent coding partner. It understands your project context, follows best practices, and generates production-ready code.

**The AI can:**
- Generate complete components from descriptions
- Fix bugs and improve code quality
- Explain complex code concepts
- Suggest architectural improvements
- Create database schemas and queries
- Write tests and documentation

The more context you provide, the better the AI performs. It learns from your project's patterns and maintains consistency.`,
      },
      {
        title: 'AI Capabilities',
        content: `Understanding what the AI excels at helps you get the most from it:

**Code Generation**
- UI components with proper styling
- API integrations and data fetching
- Form handling with validation
- State management patterns

**Analysis & Improvement**
- Code review and suggestions
- Performance optimization
- Accessibility improvements
- Security best practices

**Learning & Explanation**
- Concept explanations
- Code walkthroughs
- Best practice guidance`,
        tip: 'The AI works best when you treat it as a collaborator. Share your goals, not just tasks.',
      },
      {
        title: 'Context and Memory',
        content: `The AI maintains context about your project through several mechanisms:

**Project Context**
- File structure and contents
- Installed dependencies
- Component relationships
- Database schema

**Conversation History**
- Previous requests in the session
- Your preferences and patterns
- Established conventions

**Knowledge Base**
- Custom instructions you've added
- Tech stack preferences
- Code conventions`,
        codeExample: {
          language: 'typescript',
          code: `// Example: Knowledge Base Configuration
interface KnowledgeBase {
  instructions: string;
  techStack: { name: string; version?: string }[];
  conventions: {
    componentNaming: 'PascalCase';
    fileNaming: 'kebab-case';
    stateManagement: 'react-query';
  };
}`,
          filename: 'knowledge-base.ts'
        }
      },
      {
        title: 'Limitations to Know',
        content: `While powerful, the AI has some limitations:

**Cannot access external services**
- No live API calls during generation
- Cannot browse the web in real-time
- External data must be provided

**May need guidance for**
- Complex business logic
- Highly specific requirements
- Legacy system integration

**Works best with**
- Clear, specific requests
- Incremental changes
- Standard web technologies`,
        warning: 'Always review generated code before deploying to production. The AI is a powerful tool, but human oversight ensures quality.',
      },
      {
        title: 'Best Practices',
        content: `Maximize your productivity with these best practices:

1. **Start with the big picture** - Describe your overall goal before diving into details
2. **Be specific** - "Add a blue button" is better than "make it look nice"
3. **Iterate** - Build incrementally rather than requesting everything at once
4. **Review changes** - Check generated code and ask for adjustments
5. **Use examples** - Share screenshots or code samples for reference
6. **Ask questions** - The AI can explain its choices and alternatives`,
      }
    ],
    relatedDocs: ['ab-2', 'ab-3', 'gs-1']
  },
  {
    id: 'ab-2',
    slug: 'prompt-engineering-tips',
    title: 'Prompt Engineering Tips',
    description: 'Master the art of writing effective prompts to get exactly what you need from the AI assistant.',
    category: 'AI Builder',
    categorySlug: 'ai-builder',
    icon: Zap,
    readTime: '10 min',
    lastUpdated: '2024-01-11',
    sections: [
      {
        title: 'The Art of Prompting',
        content: `Writing effective prompts is key to productive AI collaboration. A well-crafted prompt gives the AI the context and specificity it needs to generate exactly what you want.

Think of prompting as giving instructions to a very capable but literal-minded assistant. The clearer your instructions, the better the results.`,
      },
      {
        title: 'Prompt Structure',
        content: `A good prompt typically includes:

1. **Action** - What you want done (create, update, fix, explain)
2. **Subject** - What you're working with (component, page, function)
3. **Details** - Specific requirements and constraints
4. **Context** - Relevant background information

**Basic formula:**
\`[Action] a [Subject] that [Details] with [Context]\``,
        codeExample: {
          language: 'markdown',
          code: `# Example Prompts

## Basic
"Create a button component"

## Better
"Create a primary button component with loading state"

## Best
"Create a Button component with variants (primary, secondary, outline), 
sizes (sm, md, lg), and a loading state that shows a spinner 
and disables interaction. Use the existing design tokens."`,
          filename: 'prompts.md'
        }
      },
      {
        title: 'Effective Patterns',
        content: `These patterns consistently produce good results:

**Reference existing code**
"Update the UserCard component to match the styling of ProductCard"

**Describe behavior**
"Create a dropdown menu that closes when clicking outside"

**Specify technologies**
"Add form validation using react-hook-form and zod"

**Include constraints**
"Build a responsive grid that works on mobile without horizontal scroll"

**Request iterations**
"Improve the loading state with a skeleton placeholder"`,
        tip: 'If the first result isn\'t perfect, refine with follow-up prompts. "Make it more compact" or "Use icons instead of text" work great.',
      },
      {
        title: 'Common Mistakes',
        content: `Avoid these common prompting pitfalls:

**Too vague**
❌ "Make it better"
✅ "Improve the contrast for accessibility and add hover states"

**Too much at once**
❌ "Build a complete e-commerce site with cart, checkout, admin panel..."
✅ "Create the product listing page first, with a grid of product cards"

**Assuming context**
❌ "Fix the bug" 
✅ "Fix the TypeError in UserProfile.tsx on line 42"

**Ignoring constraints**
❌ "Add a fancy animation"
✅ "Add a subtle fade-in animation that respects reduced motion preferences"`,
        warning: 'Avoid requesting changes to files you haven\'t opened or referenced. The AI works best with explicit context.',
      },
      {
        title: 'Advanced Techniques',
        content: `Level up with these advanced prompting strategies:

**Chain prompts** for complex features:
1. "Create the data model for a blog"
2. "Build the API endpoints using edge functions"
3. "Create the blog post component"
4. "Add the list view with pagination"

**Use comparisons:**
"Make the pricing cards look like Stripe's pricing page, with popular plan highlighted"

**Request alternatives:**
"Show me 3 different layout options for this dashboard"

**Ask for explanations:**
"Explain why you chose this state management approach"`,
      }
    ],
    relatedDocs: ['ab-1', 'ab-3', 'gs-3']
  },
  {
    id: 'ab-3',
    slug: 'code-generation-best-practices',
    title: 'Code Generation Best Practices',
    description: 'Learn how to review, customize, and optimize AI-generated code for production use.',
    category: 'AI Builder',
    categorySlug: 'ai-builder',
    icon: Zap,
    readTime: '8 min',
    lastUpdated: '2024-01-10',
    sections: [
      {
        title: 'Reviewing Generated Code',
        content: `AI-generated code is a starting point, not the final product. Always review before committing:

**Check for:**
- Correct file placement
- Proper imports
- Type safety
- Edge cases
- Error handling
- Accessibility

The AI follows best practices, but your domain knowledge adds essential context.`,
      },
      {
        title: 'Customization Workflow',
        content: `Establish a workflow for customizing generated code:

1. **Generate** - Let the AI create the initial version
2. **Review** - Read through the generated code
3. **Test** - Verify it works in the preview
4. **Refine** - Ask for specific changes
5. **Polish** - Make final manual adjustments

This iterative approach produces the best results while minimizing manual work.`,
        codeExample: {
          language: 'tsx',
          code: `// AI Generated - Review and customize
const DataTable = ({ data, columns }) => {
  // TODO: Add sorting functionality
  // TODO: Consider pagination for large datasets
  // TODO: Add loading state
  
  return (
    <Table>
      <TableHeader>
        {columns.map(col => (
          <TableHead key={col.key}>{col.label}</TableHead>
        ))}
      </TableHeader>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id}>
            {columns.map(col => (
              <TableCell key={col.key}>{row[col.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};`,
          filename: 'DataTable.tsx'
        }
      },
      {
        title: 'Optimization Tips',
        content: `Optimize generated code for production:

**Performance**
- Add React.memo for expensive components
- Implement proper loading states
- Use virtualization for long lists
- Optimize images and assets

**Maintainability**
- Add meaningful comments
- Extract reusable logic into hooks
- Create consistent patterns
- Write tests for critical paths`,
        tip: 'Ask the AI to optimize: "Add memoization and loading states to improve performance"',
      },
      {
        title: 'Testing Generated Code',
        content: `Testing ensures generated code works correctly:

**Manual testing**
- Test all user interactions
- Check responsive behavior
- Verify error states
- Test edge cases

**Automated testing**
- Ask the AI to generate tests
- Use the testing framework included in your project
- Focus on critical user flows`,
        codeExample: {
          language: 'tsx',
          code: `// AI can generate tests too!
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});`,
          filename: 'Button.test.tsx'
        }
      }
    ],
    relatedDocs: ['ab-1', 'ab-2', 'comp-3']
  }
];

const componentArticles: DocArticle[] = [
  {
    id: 'comp-1',
    slug: 'component-overview',
    title: 'Component Overview',
    description: 'Explore the comprehensive component library available in Kernel, built on shadcn/ui and Radix primitives.',
    category: 'Components',
    categorySlug: 'components',
    icon: Code,
    readTime: '12 min',
    lastUpdated: '2024-01-09',
    sections: [
      {
        title: 'Component Library',
        content: `Kernel includes a rich component library based on shadcn/ui, which provides beautifully designed, accessible components built on Radix UI primitives.

**Why shadcn/ui?**
- Fully customizable - you own the code
- Accessible by default
- Dark mode support built-in
- Consistent design language
- TypeScript support

Components are copied into your project, giving you full control over customization.`,
      },
      {
        title: 'Available Components',
        content: `The component library includes:

**Layout**
- Card, Dialog, Sheet, Drawer
- Accordion, Collapsible, Tabs
- Separator, Aspect Ratio

**Forms**
- Button, Input, Textarea
- Select, Checkbox, Radio
- Switch, Slider, Toggle

**Data Display**
- Table, Avatar, Badge
- Tooltip, Hover Card
- Progress, Skeleton

**Navigation**
- Navigation Menu, Breadcrumb
- Command (⌘K), Context Menu
- Dropdown Menu, Menubar

**Feedback**
- Alert, Toast, Sonner
- Alert Dialog
- Progress`,
      },
      {
        title: 'Using Components',
        content: `Components are imported from the \`@/components/ui\` directory:`,
        codeExample: {
          language: 'tsx',
          code: `import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const LoginCard = () => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" type="email" />
        <Input placeholder="Password" type="password" className="mt-4" />
        <Button className="w-full mt-4">Sign In</Button>
      </CardContent>
    </Card>
  );
};`,
          filename: 'LoginCard.tsx'
        }
      },
      {
        title: 'Component Variants',
        content: `Most components support variants for different styles and sizes:

**Button variants:**
- default, destructive, outline, secondary, ghost, link

**Button sizes:**
- default, sm, lg, icon

Variants are implemented using class-variance-authority (CVA) for type-safe styling.`,
        codeExample: {
          language: 'tsx',
          code: `// Button variants example
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus /></Button>`,
          filename: 'button-examples.tsx'
        }
      },
      {
        title: 'Composing Components',
        content: `Components are designed to be composed together:`,
        codeExample: {
          language: 'tsx',
          code: `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ConfirmDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};`,
          filename: 'ConfirmDialog.tsx'
        },
        tip: 'Use the asChild prop to compose trigger elements with your own components.',
      }
    ],
    relatedDocs: ['comp-2', 'comp-3', 'ds-1']
  },
  {
    id: 'comp-2',
    slug: 'customizing-components',
    title: 'Customizing Components',
    description: 'Learn how to customize component styles, create variants, and extend functionality.',
    category: 'Components',
    categorySlug: 'components',
    icon: Code,
    readTime: '10 min',
    lastUpdated: '2024-01-08',
    sections: [
      {
        title: 'Styling with Tailwind',
        content: `Components use Tailwind CSS for styling. You can customize them by:

1. **Adding classes** - Pass additional classes via className
2. **Modifying the component file** - Edit the source in /components/ui
3. **Updating the design system** - Change CSS variables

The \`cn()\` utility merges classes intelligently, handling conflicts properly.`,
        codeExample: {
          language: 'tsx',
          code: `import { cn } from "@/lib/utils";

// Adding custom classes
<Button className="rounded-full px-8">Pill Button</Button>

// Conditional classes
<Card className={cn(
  "transition-all",
  isSelected && "ring-2 ring-primary",
  isDisabled && "opacity-50"
)}>
  Content
</Card>`,
          filename: 'custom-styles.tsx'
        }
      },
      {
        title: 'Creating Custom Variants',
        content: `Add new variants using class-variance-authority:`,
        codeExample: {
          language: 'tsx',
          code: `// In components/ui/button.tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        // Add your custom variant
        success: "bg-green-500 text-white hover:bg-green-600",
        premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        // Add custom size
        xl: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);`,
          filename: 'button.tsx'
        }
      },
      {
        title: 'Extending Components',
        content: `Create wrapper components for reusable customizations:`,
        codeExample: {
          language: 'tsx',
          code: `// Custom wrapper with additional functionality
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const LoadingButton = ({
  isLoading,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
};

// Usage
<LoadingButton isLoading={isPending}>
  Save Changes
</LoadingButton>`,
          filename: 'LoadingButton.tsx'
        },
        tip: 'Wrapper components are great for adding common patterns like loading states, icons, or tooltips.',
      },
      {
        title: 'Theme Customization',
        content: `Customize the design system by modifying CSS variables:`,
        codeExample: {
          language: 'css',
          code: `/* In index.css */
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Customize your colors */
  --accent: 262 83% 58%;
  --accent-foreground: 210 40% 98%;
  
  /* Custom radius */
  --radius: 0.75rem;
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
}`,
          filename: 'index.css'
        },
        note: 'Changes to CSS variables automatically apply to all components using those tokens.',
      }
    ],
    relatedDocs: ['comp-1', 'comp-3', 'ds-2']
  },
  {
    id: 'comp-3',
    slug: 'creating-custom-components',
    title: 'Creating Custom Components',
    description: 'Build your own reusable components following best practices and patterns.',
    category: 'Components',
    categorySlug: 'components',
    icon: Code,
    readTime: '15 min',
    lastUpdated: '2024-01-07',
    sections: [
      {
        title: 'Component Design Principles',
        content: `Follow these principles when creating components:

**Single Responsibility** - Each component does one thing well
**Composability** - Components can be combined easily
**Flexibility** - Accept props for customization
**Accessibility** - Include ARIA attributes and keyboard support
**Consistency** - Follow project conventions`,
      },
      {
        title: 'Basic Component Structure',
        content: `A well-structured component includes:`,
        codeExample: {
          language: 'tsx',
          code: `import * as React from "react";
import { cn } from "@/lib/utils";

// 1. Define props interface
interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "active" | "inactive" | "pending";
  size?: "sm" | "md" | "lg";
}

// 2. Define variant styles
const statusStyles = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

// 3. Create component with forwardRef
const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = "md", className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          statusStyles[status],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children || status}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };`,
          filename: 'StatusBadge.tsx'
        }
      },
      {
        title: 'Compound Components',
        content: `For complex UI, use the compound component pattern:`,
        codeExample: {
          language: 'tsx',
          code: `import * as React from "react";
import { cn } from "@/lib/utils";

// Context for shared state
interface StatsCardContextValue {
  variant?: "default" | "highlight";
}

const StatsCardContext = React.createContext<StatsCardContextValue>({});

// Root component
const StatsCard = ({
  children,
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & StatsCardContextValue) => {
  return (
    <StatsCardContext.Provider value={{ variant }}>
      <div 
        className={cn(
          "rounded-lg border p-4",
          variant === "highlight" && "bg-primary/5 border-primary/20",
          className
        )} 
        {...props}
      >
        {children}
      </div>
    </StatsCardContext.Provider>
  );
};

// Child components
const StatsCardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-sm font-medium text-muted-foreground", className)} {...props} />
);

const StatsCardValue = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-2xl font-bold mt-1", className)} {...props} />
);

// Usage:
// <StatsCard variant="highlight">
//   <StatsCardTitle>Total Revenue</StatsCardTitle>
//   <StatsCardValue>$45,231.89</StatsCardValue>
// </StatsCard>

export { StatsCard, StatsCardTitle, StatsCardValue };`,
          filename: 'StatsCard.tsx'
        },
        tip: 'Compound components are ideal for card-like structures, forms, and navigation elements.',
      },
      {
        title: 'Adding Accessibility',
        content: `Make components accessible by default:`,
        codeExample: {
          language: 'tsx',
          code: `import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed, onPressedChange, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={pressed}
        data-state={pressed ? "on" : "off"}
        onClick={() => onPressedChange(!pressed)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onPressedChange(!pressed);
          }
        }}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          pressed ? "bg-primary text-primary-foreground" : "bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToggleButton.displayName = "ToggleButton";

export { ToggleButton };`,
          filename: 'ToggleButton.tsx'
        },
        note: 'Always include keyboard handlers, ARIA attributes, and focus styles for accessibility.',
      }
    ],
    relatedDocs: ['comp-1', 'comp-2', 'ab-3']
  }
];

const databaseArticles: DocArticle[] = [
  {
    id: 'db-1',
    slug: 'database-setup',
    title: 'Database Setup',
    description: 'Enable and configure the database for your Kernel project with step-by-step guidance.',
    category: 'Database',
    categorySlug: 'database',
    icon: Database,
    readTime: '8 min',
    lastUpdated: '2024-01-06',
    sections: [
      {
        title: 'Enabling the Database',
        content: `Kernel projects include a powerful built-in database powered by PostgreSQL. To enable it:

1. Open your project settings
2. Navigate to the "Cloud" tab
3. Click "Enable Database"
4. Wait for provisioning (usually under 30 seconds)

Once enabled, you'll have access to:
- Full PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)
- Automatic backups`,
      },
      {
        title: 'Database Panel',
        content: `The Database Panel provides a visual interface for managing your data:

**Tables View** - See all your tables at a glance
**Schema Editor** - Create and modify table structures
**Data Grid** - View and edit records directly
**Relationship Diagram** - Visualize table relationships

Access the Database Panel from the left sidebar when in the Builder view.`,
        tip: 'You can create tables using natural language: "Create a users table with email, name, and avatar columns"',
      },
      {
        title: 'Connecting in Code',
        content: `Use the Supabase client to interact with your database:`,
        codeExample: {
          language: 'typescript',
          code: `import { supabase } from "@/integrations/supabase/client";

// Fetch data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('active', true);

// Insert data
const { data: newUser, error } = await supabase
  .from('users')
  .insert({ email: 'user@example.com', name: 'John' })
  .select()
  .single();

// Update data
const { error } = await supabase
  .from('users')
  .update({ name: 'Jane' })
  .eq('id', userId);

// Delete data
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);`,
          filename: 'database.ts'
        }
      },
      {
        title: 'Type Safety',
        content: `Kernel automatically generates TypeScript types for your database schema:`,
        codeExample: {
          language: 'typescript',
          code: `// Types are auto-generated in @/integrations/supabase/types

import { Tables } from "@/integrations/supabase/types";

// Use the generated types
type User = Tables<'users'>;

const displayUser = (user: User) => {
  console.log(user.name, user.email);
};

// With React Query
const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) throw error;
      return data as User[];
    }
  });
};`,
          filename: 'types-example.ts'
        },
        note: 'Types are regenerated automatically when you modify your database schema.',
      }
    ],
    relatedDocs: ['db-2', 'db-3', 'auth-3']
  },
  {
    id: 'db-2',
    slug: 'schema-design',
    title: 'Schema Design',
    description: 'Learn best practices for designing efficient and scalable database schemas.',
    category: 'Database',
    categorySlug: 'database',
    icon: Database,
    readTime: '12 min',
    lastUpdated: '2024-01-05',
    sections: [
      {
        title: 'Schema Design Principles',
        content: `Good schema design is foundational to your application:

**Normalize appropriately** - Balance normalization with practical needs
**Choose correct types** - Use the right PostgreSQL types for your data
**Plan for scale** - Consider future growth in your design
**Add indexes** - Optimize common query patterns
**Document relationships** - Make foreign keys explicit`,
      },
      {
        title: 'Common Patterns',
        content: `Here are common schema patterns for web applications:

**Users with Profiles**
- auth.users (managed by auth system)
- public.profiles (custom user data)

**Content with Authors**
- Link content to user IDs
- Add timestamps for auditing

**Many-to-Many Relationships**
- Use junction tables
- Add additional relationship data when needed`,
        codeExample: {
          language: 'sql',
          code: `-- Users profile table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tags (many-to-many)
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE public.post_tags (
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);`,
          filename: 'schema.sql'
        }
      },
      {
        title: 'Data Types',
        content: `Choose appropriate PostgreSQL types:

| Data | Recommended Type |
|------|------------------|
| IDs | UUID |
| Short text | TEXT or VARCHAR(n) |
| Long text | TEXT |
| Numbers | INTEGER, BIGINT, NUMERIC |
| Decimals | NUMERIC(precision, scale) |
| Booleans | BOOLEAN |
| Dates | DATE |
| Timestamps | TIMESTAMPTZ |
| JSON data | JSONB |
| Arrays | TEXT[], INTEGER[], etc. |`,
        warning: 'Avoid using SERIAL for IDs. UUIDs are more secure and work better in distributed systems.',
      },
      {
        title: 'Indexes',
        content: `Add indexes to improve query performance:`,
        codeExample: {
          language: 'sql',
          code: `-- Index on frequently queried columns
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_published ON public.posts(published) 
  WHERE published = true;

-- Full-text search index
CREATE INDEX idx_posts_search ON public.posts 
  USING gin(to_tsvector('english', title || ' ' || content));

-- Composite index for common query patterns
CREATE INDEX idx_posts_author_date ON public.posts(author_id, created_at DESC);`,
          filename: 'indexes.sql'
        },
        tip: 'Only add indexes for columns you frequently query or sort by. Too many indexes slow down writes.',
      }
    ],
    relatedDocs: ['db-1', 'db-3', 'auth-3']
  },
  {
    id: 'db-3',
    slug: 'querying-data',
    title: 'Querying Data',
    description: 'Master data querying with filters, joins, pagination, and real-time subscriptions.',
    category: 'Database',
    categorySlug: 'database',
    icon: Database,
    readTime: '15 min',
    lastUpdated: '2024-01-04',
    sections: [
      {
        title: 'Basic Queries',
        content: `The Supabase client provides a powerful query builder:`,
        codeExample: {
          language: 'typescript',
          code: `import { supabase } from "@/integrations/supabase/client";

// Select all columns
const { data } = await supabase.from('posts').select('*');

// Select specific columns
const { data } = await supabase
  .from('posts')
  .select('id, title, published');

// Select with relationships
const { data } = await supabase
  .from('posts')
  .select(\`
    id,
    title,
    author:profiles(display_name, avatar_url),
    tags(name)
  \`);`,
          filename: 'queries.ts'
        }
      },
      {
        title: 'Filtering',
        content: `Filter results with various operators:`,
        codeExample: {
          language: 'typescript',
          code: `// Equality
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true);

// Not equal
const { data } = await supabase
  .from('posts')
  .select('*')
  .neq('status', 'draft');

// Greater than / Less than
const { data } = await supabase
  .from('products')
  .select('*')
  .gte('price', 10)
  .lte('price', 100);

// Pattern matching
const { data } = await supabase
  .from('posts')
  .select('*')
  .ilike('title', '%react%');

// In array
const { data } = await supabase
  .from('posts')
  .select('*')
  .in('status', ['published', 'featured']);

// Contains (for arrays)
const { data } = await supabase
  .from('posts')
  .select('*')
  .contains('tags', ['javascript']);`,
          filename: 'filtering.ts'
        }
      },
      {
        title: 'Sorting and Pagination',
        content: `Order results and implement pagination:`,
        codeExample: {
          language: 'typescript',
          code: `// Sorting
const { data } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false });

// Multiple sort columns
const { data } = await supabase
  .from('posts')
  .select('*')
  .order('featured', { ascending: false })
  .order('created_at', { ascending: false });

// Pagination with limit and offset
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 9); // First 10 items

// Cursor-based pagination (more efficient)
const { data } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .lt('created_at', lastSeenTimestamp)
  .limit(10);`,
          filename: 'pagination.ts'
        },
        tip: 'For large datasets, cursor-based pagination performs better than offset-based.',
      },
      {
        title: 'Real-time Subscriptions',
        content: `Subscribe to live database changes:`,
        codeExample: {
          language: 'typescript',
          code: `import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const useRealtimePosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Initial fetch
    supabase.from('posts').select('*').then(({ data }) => {
      if (data) setPosts(data);
    });

    // Subscribe to changes
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(p => 
              p.id === payload.new.id ? payload.new : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return posts;
};`,
          filename: 'realtime.ts'
        },
        note: 'Enable real-time for tables in your database settings before using subscriptions.',
      }
    ],
    relatedDocs: ['db-1', 'db-2', 'auth-3']
  }
];

const authArticles: DocArticle[] = [
  {
    id: 'auth-1',
    slug: 'auth-overview',
    title: 'Auth Overview',
    description: 'Understand Kernel\'s authentication system architecture and available providers.',
    category: 'Authentication',
    categorySlug: 'authentication',
    icon: Shield,
    readTime: '10 min',
    lastUpdated: '2024-01-03',
    sections: [
      {
        title: 'Authentication Architecture',
        content: `Kernel's authentication is built on a secure, battle-tested foundation that handles:

**User Management**
- Email/password signup and login
- Email verification
- Password reset flows
- Session management

**OAuth Providers**
- Google
- GitHub
- Additional providers on request

**Security Features**
- JWT-based sessions
- Secure cookie handling
- CSRF protection
- Rate limiting`,
      },
      {
        title: 'Auth Flow',
        content: `Understanding the authentication flow:

1. **Sign Up** - User creates account with email/password or OAuth
2. **Verification** - Email confirmation (optional, configurable)
3. **Sign In** - User authenticates and receives session
4. **Session** - JWT stored securely, auto-refreshed
5. **Sign Out** - Session invalidated, tokens cleared

Sessions are automatically refreshed before expiration, providing a seamless user experience.`,
      },
      {
        title: 'Using Auth in Code',
        content: `The auth system is accessed through the Supabase client:`,
        codeExample: {
          language: 'typescript',
          code: `import { supabase } from "@/integrations/supabase/client";

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});`,
          filename: 'auth-basics.ts'
        }
      },
      {
        title: 'Auth Hook',
        content: `Use the provided auth hook for React components:`,
        codeExample: {
          language: 'tsx',
          code: `import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) return <Skeleton />;
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
};`,
          filename: 'ProfilePage.tsx'
        },
        tip: 'The useAuth hook handles loading states and automatically redirects unauthenticated users.',
      }
    ],
    relatedDocs: ['auth-2', 'auth-3', 'db-1']
  },
  {
    id: 'auth-2',
    slug: 'social-login-setup',
    title: 'Social Login Setup',
    description: 'Configure Google, GitHub, and other OAuth providers for seamless authentication.',
    category: 'Authentication',
    categorySlug: 'authentication',
    icon: Shield,
    readTime: '12 min',
    lastUpdated: '2024-01-02',
    sections: [
      {
        title: 'Available Providers',
        content: `Kernel supports multiple OAuth providers:

**Google** - Most popular, great for consumer apps
**GitHub** - Perfect for developer-focused applications
**Additional Providers** - Contact support for others

Social login provides:
- One-click authentication
- Access to user profile data
- Reduced friction for sign-ups
- No password management for users`,
      },
      {
        title: 'Google OAuth Setup',
        content: `To enable Google authentication:

1. Create a project in Google Cloud Console
2. Enable the Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Copy Client ID and Secret to Kernel settings

**Redirect URI format:**
\`https://your-project.supabase.co/auth/v1/callback\``,
        warning: 'Keep your OAuth secrets secure. Never commit them to version control.',
      },
      {
        title: 'GitHub OAuth Setup',
        content: `To enable GitHub authentication:

1. Go to GitHub Developer Settings
2. Create a new OAuth App
3. Set the Authorization callback URL
4. Copy Client ID and Secret to Kernel settings

**Callback URL format:**
\`https://your-project.supabase.co/auth/v1/callback\``,
      },
      {
        title: 'Implementing Social Login',
        content: `Add social login buttons to your auth forms:`,
        codeExample: {
          language: 'tsx',
          code: `import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SocialAuthButtons = () => {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`
      }
    });
    if (error) console.error('Error:', error);
  };

  const handleGitHubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`
      }
    });
    if (error) console.error('Error:', error);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={handleGoogleSignIn}>
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button variant="outline" onClick={handleGitHubSignIn}>
        <GithubIcon className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
};`,
          filename: 'SocialAuthButtons.tsx'
        }
      }
    ],
    relatedDocs: ['auth-1', 'auth-3', 'gs-2']
  },
  {
    id: 'auth-3',
    slug: 'role-based-access',
    title: 'Role-Based Access',
    description: 'Implement user roles, permissions, and Row Level Security policies.',
    category: 'Authentication',
    categorySlug: 'authentication',
    icon: Shield,
    readTime: '15 min',
    lastUpdated: '2024-01-01',
    sections: [
      {
        title: 'Understanding RLS',
        content: `Row Level Security (RLS) is PostgreSQL's built-in authorization system. It allows you to define policies that control which rows users can access.

**Why RLS?**
- Security at the database level
- Policies can't be bypassed from the client
- Works automatically with all queries
- Fine-grained access control`,
      },
      {
        title: 'Basic RLS Policies',
        content: `Here are common RLS patterns:`,
        codeExample: {
          language: 'sql',
          code: `-- Enable RLS on a table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Users can read all published posts
CREATE POLICY "Public posts are viewable by everyone"
ON public.posts FOR SELECT
USING (published = true);

-- Users can read their own drafts
CREATE POLICY "Users can view their own drafts"
ON public.posts FOR SELECT
USING (auth.uid() = author_id);

-- Users can only insert their own posts
CREATE POLICY "Users can insert their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Users can only update their own posts
CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = author_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = author_id);`,
          filename: 'rls-policies.sql'
        }
      },
      {
        title: 'User Roles',
        content: `Implement a roles system for different access levels:`,
        codeExample: {
          language: 'sql',
          code: `-- Create roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Helper function to check roles
CREATE OR REPLACE FUNCTION public.has_role(
  _role TEXT,
  _user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Admin-only policy
CREATE POLICY "Admins can do anything"
ON public.posts FOR ALL
USING (public.has_role('admin'));

-- Moderator policy
CREATE POLICY "Moderators can update any post"
ON public.posts FOR UPDATE
USING (public.has_role('moderator'));`,
          filename: 'roles.sql'
        },
        warning: 'Always test RLS policies thoroughly. A misconfigured policy can expose sensitive data.',
      },
      {
        title: 'Frontend Role Checks',
        content: `Check roles in your React components:`,
        codeExample: {
          language: 'tsx',
          code: `import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useUserRole = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      return data?.role || 'user';
    },
    enabled: !!user
  });
};

// Usage in component
const AdminPanel = () => {
  const { data: role, isLoading } = useUserRole();
  
  if (isLoading) return <Skeleton />;
  if (role !== 'admin') return <AccessDenied />;
  
  return <div>Admin content here</div>;
};`,
          filename: 'useUserRole.tsx'
        },
        note: 'Frontend role checks are for UX only. Always enforce access control with RLS policies.',
      }
    ],
    relatedDocs: ['auth-1', 'auth-2', 'db-2']
  }
];

const designSystemArticles: DocArticle[] = [
  {
    id: 'ds-1',
    slug: 'theme-configuration',
    title: 'Theme Configuration',
    description: 'Configure your project\'s theme with CSS variables, Tailwind settings, and design tokens.',
    category: 'Design System',
    categorySlug: 'design-system',
    icon: Palette,
    readTime: '10 min',
    lastUpdated: '2023-12-30',
    sections: [
      {
        title: 'Theme Architecture',
        content: `Kernel's theme system is built on CSS custom properties (variables) and Tailwind CSS. This architecture provides:

**Consistency** - Single source of truth for design tokens
**Flexibility** - Easy to customize and extend
**Dark Mode** - Built-in support for light/dark themes
**Type Safety** - Tailwind IntelliSense support`,
      },
      {
        title: 'CSS Variables',
        content: `The core theme is defined in index.css:`,
        codeExample: {
          language: 'css',
          code: `:root {
  /* Background and foreground */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* Card surfaces */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  /* Primary brand color */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;

  /* Secondary color */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  /* Muted elements */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Accents and highlights */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructive actions */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  /* Borders and inputs */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  /* Border radius */
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}`,
          filename: 'index.css'
        }
      },
      {
        title: 'Tailwind Configuration',
        content: `The tailwind.config.ts maps CSS variables to Tailwind classes:`,
        codeExample: {
          language: 'typescript',
          code: `// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... other colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};`,
          filename: 'tailwind.config.ts'
        },
        tip: 'Always use semantic color classes (bg-primary) instead of raw colors (bg-blue-500) for theme consistency.',
      },
      {
        title: 'Using Theme Variables',
        content: `Access theme variables in your components:`,
        codeExample: {
          language: 'tsx',
          code: `// Using Tailwind classes (recommended)
<div className="bg-background text-foreground">
  <h1 className="text-primary">Themed Heading</h1>
  <p className="text-muted-foreground">Muted text</p>
  <Button className="bg-primary text-primary-foreground">
    Primary Button
  </Button>
</div>

// Accessing CSS variables directly
<div style={{ 
  backgroundColor: 'hsl(var(--background))',
  color: 'hsl(var(--foreground))' 
}}>
  Custom styled element
</div>`,
          filename: 'themed-component.tsx'
        }
      }
    ],
    relatedDocs: ['ds-2', 'ds-3', 'comp-2']
  },
  {
    id: 'ds-2',
    slug: 'colors-and-typography',
    title: 'Colors & Typography',
    description: 'Define your color palette, typography scale, and create a cohesive visual language.',
    category: 'Design System',
    categorySlug: 'design-system',
    icon: Palette,
    readTime: '12 min',
    lastUpdated: '2023-12-29',
    sections: [
      {
        title: 'Color Palette',
        content: `A well-designed color palette includes:

**Primary** - Main brand color for CTAs and key elements
**Secondary** - Supporting color for less prominent actions
**Accent** - Highlight color for drawing attention
**Neutral** - Grays for text, backgrounds, and borders
**Semantic** - Success, warning, error, info colors`,
      },
      {
        title: 'Creating Custom Colors',
        content: `Add custom colors to your theme:`,
        codeExample: {
          language: 'css',
          code: `:root {
  /* Custom brand colors */
  --brand-50: 214 100% 97%;
  --brand-100: 214 95% 93%;
  --brand-200: 213 97% 87%;
  --brand-300: 212 96% 78%;
  --brand-400: 213 94% 68%;
  --brand-500: 217 91% 60%;  /* Primary */
  --brand-600: 221 83% 53%;
  --brand-700: 224 76% 48%;
  --brand-800: 226 71% 40%;
  --brand-900: 224 64% 33%;

  /* Semantic colors */
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 0%;
  --info: 199 89% 48%;
  --info-foreground: 0 0% 100%;
}`,
          filename: 'custom-colors.css'
        }
      },
      {
        title: 'Typography Scale',
        content: `Define a consistent typography scale:`,
        codeExample: {
          language: 'typescript',
          code: `// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3' }],
        'display-xs': ['1.5rem', { lineHeight: '1.3' }],
      },
    },
  },
};`,
          filename: 'typography.ts'
        }
      },
      {
        title: 'Typography Components',
        content: `Create reusable typography components:`,
        codeExample: {
          language: 'tsx',
          code: `import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'display-2xl' | 'display-xl' | 'display-lg' | 'display-md' | 'display-sm' | 'display-xs';
}

export const Heading = ({
  as: Component = 'h2',
  size = 'display-md',
  className,
  children,
  ...props
}: HeadingProps) => {
  return (
    <Component 
      className={cn(
        "font-display font-bold tracking-tight",
        {
          'text-display-2xl': size === 'display-2xl',
          'text-display-xl': size === 'display-xl',
          'text-display-lg': size === 'display-lg',
          'text-display-md': size === 'display-md',
          'text-display-sm': size === 'display-sm',
          'text-display-xs': size === 'display-xs',
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};`,
          filename: 'Heading.tsx'
        },
        tip: 'Use a display font for headlines and a readable sans-serif for body text.',
      }
    ],
    relatedDocs: ['ds-1', 'ds-3', 'comp-1']
  },
  {
    id: 'ds-3',
    slug: 'dark-mode-support',
    title: 'Dark Mode Support',
    description: 'Implement dark mode with theme switching, system preference detection, and persistence.',
    category: 'Design System',
    categorySlug: 'design-system',
    icon: Palette,
    readTime: '8 min',
    lastUpdated: '2023-12-28',
    sections: [
      {
        title: 'Dark Mode Architecture',
        content: `Kernel uses a class-based dark mode approach:

1. A \`.dark\` class is added to the \`<html>\` element
2. CSS variables are overridden in the \`.dark\` scope
3. Tailwind's dark: prefix works automatically
4. Theme preference is persisted in localStorage`,
      },
      {
        title: 'Defining Dark Colors',
        content: `Override CSS variables for dark mode:`,
        codeExample: {
          language: 'css',
          code: `.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}`,
          filename: 'dark-mode.css'
        }
      },
      {
        title: 'Theme Provider',
        content: `Use the theme provider for switching themes:`,
        codeExample: {
          language: 'tsx',
          code: `import { ThemeProvider, useTheme } from "next-themes";

// Wrap your app
const App = () => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system"
      enableSystem
    >
      <YourApp />
    </ThemeProvider>
  );
};

// Theme toggle component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};`,
          filename: 'theme-toggle.tsx'
        }
      },
      {
        title: 'Dark Mode Tips',
        content: `Best practices for dark mode design:

**Reduce contrast slightly** - Pure white (#fff) can be harsh on dark backgrounds
**Adjust shadows** - Use lighter shadows or glows in dark mode
**Test thoroughly** - Check all components in both modes
**Respect system preference** - Default to user's system setting
**Avoid pure black** - Slightly lighter blacks feel more natural`,
        codeExample: {
          language: 'tsx',
          code: `// Conditional styling for dark mode
<div className={cn(
  "rounded-lg border",
  "bg-card shadow-sm",
  "dark:shadow-lg dark:shadow-primary/5", // Enhanced shadow in dark
)}>
  <h2 className="text-foreground">Adaptive Card</h2>
  <p className="text-muted-foreground">
    This card looks great in both modes
  </p>
</div>`,
          filename: 'adaptive-card.tsx'
        },
        note: 'Use the dark: Tailwind prefix for mode-specific styles that can\'t be handled by CSS variables.',
      }
    ],
    relatedDocs: ['ds-1', 'ds-2', 'comp-2']
  }
];

const versionControlArticles: DocArticle[] = [
  {
    id: 'vc-1',
    slug: 'github-integration',
    title: 'GitHub Integration',
    description: 'Connect your GitHub account to sync code, collaborate, and manage version control.',
    category: 'Version Control',
    categorySlug: 'version-control',
    icon: GitBranch,
    readTime: '10 min',
    lastUpdated: '2023-12-27',
    sections: [
      {
        title: 'Connecting GitHub',
        content: `Link your GitHub account to enable powerful version control features:

1. Open Project Settings
2. Navigate to the GitHub tab
3. Click "Connect GitHub"
4. Authorize Kernel to access your repositories
5. Select or create a repository to sync

Once connected, you can push code, pull changes, and collaborate with your team.`,
      },
      {
        title: 'Syncing Your Project',
        content: `After connecting, you can sync your project:

**Push to GitHub** - Send your latest changes to the remote repository
**Pull from GitHub** - Fetch and merge remote changes
**Sync** - Combines push and pull operations

The GitHub panel shows your sync status and any pending changes.`,
        tip: 'Commit frequently with descriptive messages. The AI can help you write meaningful commit messages.',
      },
      {
        title: 'Working with Branches',
        content: `Branches help you work on features without affecting the main codebase:`,
        codeExample: {
          language: 'bash',
          code: `# Common branch workflow

# Create a new feature branch
git checkout -b feature/user-authentication

# Make changes and commit
git add .
git commit -m "Add login form component"

# Push to remote
git push -u origin feature/user-authentication

# When ready, create a Pull Request on GitHub
# After review, merge into main`,
          filename: 'branch-workflow.sh'
        }
      },
      {
        title: 'Collaboration',
        content: `GitHub integration enables team collaboration:

**Code Reviews** - Use Pull Requests for peer review
**Issues** - Track bugs and feature requests
**Actions** - Set up CI/CD pipelines
**Projects** - Organize work with project boards

Kernel syncs with your repository, so team members can work in their preferred environment while staying in sync.`,
        note: 'Changes made directly on GitHub will be reflected in Kernel after syncing.',
      }
    ],
    relatedDocs: ['vc-2', 'vc-3', 'deploy-1']
  },
  {
    id: 'vc-2',
    slug: 'version-history',
    title: 'Version History',
    description: 'Track changes, view history, and restore previous versions of your code.',
    category: 'Version Control',
    categorySlug: 'version-control',
    icon: GitBranch,
    readTime: '8 min',
    lastUpdated: '2023-12-26',
    sections: [
      {
        title: 'Viewing History',
        content: `Kernel automatically tracks all changes to your project:

**File History** - See all versions of a specific file
**Project Timeline** - View all changes across the project
**Commit Log** - Browse commits with messages and diffs

Access history from the File Explorer by right-clicking a file and selecting "View History".`,
      },
      {
        title: 'Comparing Versions',
        content: `Compare different versions to see what changed:

**Side-by-side diff** - See old and new code together
**Inline diff** - View changes in a single pane
**Syntax highlighting** - Code remains readable in diffs

The diff view highlights:
- Added lines (green)
- Removed lines (red)
- Modified lines (yellow)`,
      },
      {
        title: 'Restoring Previous Versions',
        content: `Roll back to a previous version if needed:

1. Open version history for the file
2. Find the version you want to restore
3. Click "Restore this version"
4. Confirm the restoration

The current version will be saved before restoration, so you can always go back.`,
        warning: 'Restoring a version replaces current file contents. Make sure to save any important changes first.',
      },
      {
        title: 'Best Practices',
        content: `Tips for effective version management:

**Commit often** - Small, frequent commits are easier to track
**Write good messages** - Describe what changed and why
**Use branches** - Keep experimental work separate
**Review before restore** - Check the diff before restoring
**Backup important states** - Tag significant milestones`,
      }
    ],
    relatedDocs: ['vc-1', 'vc-3', 'gs-3']
  },
  {
    id: 'vc-3',
    slug: 'branching-strategy',
    title: 'Branching Strategy',
    description: 'Learn branching patterns for solo development and team collaboration.',
    category: 'Version Control',
    categorySlug: 'version-control',
    icon: GitBranch,
    readTime: '10 min',
    lastUpdated: '2023-12-25',
    sections: [
      {
        title: 'Why Use Branches',
        content: `Branches let you work on features in isolation:

**Experimentation** - Try ideas without risk
**Parallel development** - Multiple features at once
**Code review** - Review before merging
**Rollback safety** - Easy to abandon failed experiments

Even for solo projects, branches help organize your work.`,
      },
      {
        title: 'Simple Branch Strategy',
        content: `For most projects, a simple strategy works best:

**main** - Production-ready code, always deployable
**feature/** - New features in development
**fix/** - Bug fixes
**experiment/** - Exploratory work`,
        codeExample: {
          language: 'markdown',
          code: `# Branch naming conventions

feature/user-authentication
feature/payment-integration
feature/dark-mode

fix/login-button-alignment
fix/api-timeout-error

experiment/new-chart-library
experiment/ai-suggestions`,
          filename: 'branch-names.md'
        }
      },
      {
        title: 'Feature Branch Workflow',
        content: `Standard workflow for feature development:`,
        codeExample: {
          language: 'bash',
          code: `# 1. Start from up-to-date main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-dashboard

# 3. Make changes and commit regularly
git add .
git commit -m "Add dashboard layout component"
git commit -m "Implement chart widgets"
git commit -m "Add responsive grid"

# 4. Push and create Pull Request
git push origin feature/new-dashboard

# 5. After review, merge to main
git checkout main
git merge feature/new-dashboard
git push origin main

# 6. Clean up
git branch -d feature/new-dashboard`,
          filename: 'feature-workflow.sh'
        }
      },
      {
        title: 'Handling Conflicts',
        content: `When branches diverge, conflicts may occur:

1. **Understand the conflict** - Git marks conflicting sections
2. **Decide resolution** - Keep one version or combine both
3. **Test thoroughly** - Ensure the merge works correctly
4. **Commit the resolution** - Complete the merge

Kernel's editor highlights conflicts and helps you resolve them.`,
        tip: 'Pull from main frequently to reduce conflict size and complexity.',
      }
    ],
    relatedDocs: ['vc-1', 'vc-2', 'deploy-1']
  }
];

const deploymentArticles: DocArticle[] = [
  {
    id: 'deploy-1',
    slug: 'deployment-options',
    title: 'Deployment Options',
    description: 'Deploy your application with one click, manage environments, and configure preview deploys.',
    category: 'Deployment',
    categorySlug: 'deployment',
    icon: Cloud,
    readTime: '8 min',
    lastUpdated: '2023-12-24',
    sections: [
      {
        title: 'One-Click Deployment',
        content: `Kernel makes deployment incredibly simple:

1. Click the "Publish" button in the top right
2. Select your deployment environment
3. Add an optional commit message
4. Click "Deploy"

Your app will be live in seconds at a unique URL like \`your-app.kernel.cool\`.`,
      },
      {
        title: 'Deployment Environments',
        content: `Manage different environments for your app:

**Preview** - Temporary deployments for testing
**Staging** - Pre-production environment
**Production** - Your live application

Each environment can have its own:
- Environment variables
- Database connections
- Feature flags`,
        tip: 'Use preview deployments to test changes before pushing to production.',
      },
      {
        title: 'Deployment Process',
        content: `What happens during deployment:

1. **Build** - Your code is compiled and optimized
2. **Test** - Automated checks run (if configured)
3. **Deploy** - Files are uploaded to the CDN
4. **Verify** - Health checks confirm success
5. **Route** - Traffic is switched to new version

The entire process typically takes 30-60 seconds.`,
      },
      {
        title: 'Rollback',
        content: `If something goes wrong, you can roll back:

1. Open the Deployments panel
2. Find the previous working deployment
3. Click "Rollback to this version"
4. Confirm the rollback

Rollbacks are instant and don't require rebuilding.`,
        warning: 'Backend changes (database, edge functions) deploy immediately and aren\'t affected by frontend rollbacks.',
      }
    ],
    relatedDocs: ['deploy-2', 'deploy-3', 'vc-1']
  },
  {
    id: 'deploy-2',
    slug: 'custom-domains',
    title: 'Custom Domains',
    description: 'Connect your own domain to your Kernel project with SSL certificates.',
    category: 'Deployment',
    categorySlug: 'deployment',
    icon: Cloud,
    readTime: '10 min',
    lastUpdated: '2023-12-23',
    sections: [
      {
        title: 'Domain Setup',
        content: `Connect your custom domain to your Kernel project:

1. Go to Project Settings > Domains
2. Enter your domain name
3. Copy the provided DNS records
4. Add the records at your DNS provider
5. Wait for verification (usually 15-30 minutes)

SSL certificates are automatically provisioned and renewed.`,
      },
      {
        title: 'DNS Configuration',
        content: `Add these records at your DNS provider:`,
        codeExample: {
          language: 'markdown',
          code: `# For apex domain (example.com)
Type: A
Name: @
Value: [IP provided by Kernel]

# For subdomain (www.example.com)
Type: CNAME
Name: www
Value: [CNAME provided by Kernel]

# For verification
Type: TXT
Name: _kernel-verify
Value: [verification token]`,
          filename: 'dns-records.md'
        }
      },
      {
        title: 'SSL Certificates',
        content: `Kernel handles SSL automatically:

**Automatic provisioning** - Certificates are created on domain verification
**Auto-renewal** - Certificates renew before expiration
**Modern security** - TLS 1.3 support
**HTTP to HTTPS** - Automatic redirection

No configuration needed - SSL just works.`,
        note: 'SSL provisioning typically takes 5-10 minutes after domain verification.',
      },
      {
        title: 'Multiple Domains',
        content: `You can connect multiple domains to one project:

- **Primary domain** - Main domain for your app
- **Redirect domains** - Redirect to primary (e.g., www to non-www)
- **Alias domains** - Same content, different URLs

Configure redirects in Project Settings > Domains.`,
      }
    ],
    relatedDocs: ['deploy-1', 'deploy-3', 'gs-1']
  },
  {
    id: 'deploy-3',
    slug: 'environment-variables',
    title: 'Environment Variables',
    description: 'Securely manage configuration and secrets across deployment environments.',
    category: 'Deployment',
    categorySlug: 'deployment',
    icon: Cloud,
    readTime: '8 min',
    lastUpdated: '2023-12-22',
    sections: [
      {
        title: 'Understanding Env Variables',
        content: `Environment variables store configuration that varies by environment:

**API Keys** - Third-party service credentials
**Feature Flags** - Toggle features per environment
**URLs** - Service endpoints
**Secrets** - Sensitive configuration

Variables are injected at build time and runtime, keeping secrets out of your code.`,
      },
      {
        title: 'Setting Variables',
        content: `Add environment variables in Project Settings:

1. Go to Settings > Environment Variables
2. Click "Add Variable"
3. Enter the key and value
4. Select which environments should have access
5. Mark as secret if sensitive

Secret variables are encrypted and never exposed in logs or client-side code.`,
        warning: 'Never commit secrets to version control. Always use environment variables for sensitive data.',
      },
      {
        title: 'Using Variables',
        content: `Access environment variables in your code:`,
        codeExample: {
          language: 'typescript',
          code: `// In client-side code (Vite)
const apiUrl = import.meta.env.VITE_API_URL;
const publicKey = import.meta.env.VITE_PUBLIC_KEY;

// Note: Only VITE_ prefixed variables are exposed to client

// In Edge Functions (server-side)
const secretKey = Deno.env.get('SECRET_API_KEY');
const dbUrl = Deno.env.get('DATABASE_URL');

// Example: API client configuration
const client = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  apiKey: import.meta.env.VITE_PUBLIC_KEY,
});`,
          filename: 'env-usage.ts'
        }
      },
      {
        title: 'Best Practices',
        content: `Environment variable best practices:

**Prefix appropriately** - Use VITE_ for client-side variables
**Use secrets for sensitive data** - Never expose API keys
**Document variables** - Keep a README of required variables
**Validate on startup** - Check required variables exist
**Use defaults wisely** - Provide sensible fallbacks`,
        codeExample: {
          language: 'typescript',
          code: `// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(\`Missing required environment variable: \${envVar}\`);
  }
}`,
          filename: 'env-validation.ts'
        }
      }
    ],
    relatedDocs: ['deploy-1', 'deploy-2', 'db-1']
  }
];

// ============= Category Definitions =============

export const docCategories: DocCategory[] = [
  {
    title: 'Getting Started',
    slug: 'getting-started',
    description: 'Learn the basics and get your first project running in minutes.',
    icon: Rocket,
    articles: gettingStartedArticles,
  },
  {
    title: 'AI Builder',
    slug: 'ai-builder',
    description: 'Harness the power of AI to build applications faster.',
    icon: Zap,
    articles: aiBuilderArticles,
  },
  {
    title: 'Components',
    slug: 'components',
    description: 'Build beautiful UIs with our component library.',
    icon: Code,
    articles: componentArticles,
  },
  {
    title: 'Database',
    slug: 'database',
    description: 'Store and manage your application data securely.',
    icon: Database,
    articles: databaseArticles,
  },
  {
    title: 'Authentication',
    slug: 'authentication',
    description: 'Secure your application with built-in auth solutions.',
    icon: Shield,
    articles: authArticles,
  },
  {
    title: 'Design System',
    slug: 'design-system',
    description: 'Create consistent, beautiful designs across your app.',
    icon: Palette,
    articles: designSystemArticles,
  },
  {
    title: 'Version Control',
    slug: 'version-control',
    description: 'Track changes and collaborate with your team.',
    icon: GitBranch,
    articles: versionControlArticles,
  },
  {
    title: 'Deployment',
    slug: 'deployment',
    description: 'Deploy your applications to production with ease.',
    icon: Cloud,
    articles: deploymentArticles,
  },
];

// ============= Helper Functions =============

export const getAllArticles = (): DocArticle[] => {
  return docCategories.flatMap(category => category.articles);
};

export const getArticleBySlug = (categorySlug: string, articleSlug: string): DocArticle | undefined => {
  const category = docCategories.find(c => c.slug === categorySlug);
  return category?.articles.find(a => a.slug === articleSlug);
};

export const getCategoryBySlug = (slug: string): DocCategory | undefined => {
  return docCategories.find(c => c.slug === slug);
};

export const getRelatedArticles = (articleIds: string[]): DocArticle[] => {
  const allArticles = getAllArticles();
  return articleIds
    .map(id => allArticles.find(a => a.id === id))
    .filter((a): a is DocArticle => a !== undefined);
};

export const searchDocumentation = (query: string): DocArticle[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return getAllArticles().filter(article => {
    const searchText = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return searchText.includes(normalizedQuery);
  });
};

export const getAdjacentArticles = (article: DocArticle): { prev?: DocArticle; next?: DocArticle } => {
  const category = docCategories.find(c => c.slug === article.categorySlug);
  if (!category) return {};

  const currentIndex = category.articles.findIndex(a => a.id === article.id);
  
  return {
    prev: currentIndex > 0 ? category.articles[currentIndex - 1] : undefined,
    next: currentIndex < category.articles.length - 1 ? category.articles[currentIndex + 1] : undefined,
  };
};
