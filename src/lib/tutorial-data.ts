import { Rocket, Code, Database, Shield, Palette, Zap } from 'lucide-react';

export interface TutorialStep {
  title: string;
  content: string;
  codeExample?: {
    language: string;
    code: string;
    filename?: string;
  };
  tip?: string;
  warning?: string;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  type: 'video' | 'article';
  category: string;
  icon: React.ElementType;
  popular?: boolean;
  prerequisites: string[];
  whatYouWillLearn: string[];
  steps: TutorialStep[];
  nextTutorial?: string;
  prevTutorial?: string;
}

export const tutorials: Tutorial[] = [
  // BEGINNER TUTORIALS
  {
    id: '1',
    slug: 'getting-started',
    title: 'Getting Started with Kernel',
    description: 'Learn the basics of Kernel and build your first application in under 10 minutes.',
    difficulty: 'Beginner',
    duration: '10 min',
    type: 'video',
    category: 'Getting Started',
    icon: Rocket,
    popular: true,
    prerequisites: [
      'A modern web browser (Chrome, Firefox, Safari, or Edge)',
      'A free Kernel account',
    ],
    whatYouWillLearn: [
      'Navigate the Kernel interface',
      'Use the AI assistant to generate code',
      'Preview your application in real-time',
      'Make your first deployment',
    ],
    steps: [
      {
        title: 'Create Your Account',
        content: `Getting started with Kernel is simple. Head to the homepage and click **"Get Started"** to create your free account.

You can sign up with:
- Email and password
- Google account
- GitHub account

Once signed in, you'll be taken to the dashboard where you can create your first project.`,
        tip: 'Use GitHub login if you plan to sync your code to a repository later.',
      },
      {
        title: 'Create Your First Project',
        content: `Click the **"New Project"** button to start building. You'll see a selection of templates to choose from:

- **Blank Project**: Start from scratch
- **Landing Page**: Pre-built marketing page
- **Dashboard**: Admin-style interface
- **E-commerce**: Product listing template

For this tutorial, select **Blank Project** and give it a name like "My First App".`,
        codeExample: {
          language: 'text',
          code: `Project Name: My First App
Template: Blank Project
Framework: React + Tailwind CSS`,
          filename: 'project-settings.txt',
        },
      },
      {
        title: 'Understanding the Interface',
        content: `The Kernel interface has three main areas:

1. **Left Panel**: Chat with the AI assistant
2. **Center Panel**: Live preview of your app
3. **Right Panel**: File explorer and code editor

The AI assistant is your primary tool for building. Simply describe what you want, and it will generate the code for you.`,
        tip: 'Press Cmd/Ctrl + K to open the command palette for quick navigation.',
      },
      {
        title: 'Build with AI',
        content: `Let's create something! In the chat panel, type:

> "Create a hero section with a heading that says 'Welcome to My App', a subtitle, and a call-to-action button"

The AI will generate the code and you'll see the changes appear in the live preview instantly.`,
        codeExample: {
          language: 'tsx',
          code: `const HeroSection = () => {
  return (
    <section className="py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to My App
      </h1>
      <p className="text-muted-foreground mb-8">
        Build amazing things with AI assistance
      </p>
      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg">
        Get Started
      </button>
    </section>
  );
};`,
          filename: 'HeroSection.tsx',
        },
      },
      {
        title: 'Deploy Your App',
        content: `Ready to share your creation? Click the **"Publish"** button in the top right corner.

Kernel will:
1. Build your application
2. Deploy it to a staging URL
3. Provide you with a shareable link

Your app is now live! Share the URL with anyone to show off your work.`,
        tip: 'You can connect a custom domain in the project settings for production apps.',
      },
    ],
    nextTutorial: 'building-todo-app',
  },
  {
    id: '2',
    slug: 'building-todo-app',
    title: 'Building a Todo App',
    description: 'Create a fully functional todo application with database persistence and user authentication.',
    difficulty: 'Beginner',
    duration: '25 min',
    type: 'video',
    category: 'Getting Started',
    icon: Code,
    prerequisites: [
      'Completed "Getting Started with Kernel" tutorial',
      'Basic understanding of web applications',
    ],
    whatYouWillLearn: [
      'Create a database table to store todos',
      'Build CRUD operations (Create, Read, Update, Delete)',
      'Add user authentication',
      'Connect the UI to the database',
    ],
    steps: [
      {
        title: 'Project Setup',
        content: `Create a new project and name it "Todo App". We'll build a complete todo list with:

- Add new tasks
- Mark tasks as complete
- Delete tasks
- Persist data in a database

Start by asking the AI: "Create a todo app interface with an input field, add button, and a list of todo items with checkboxes and delete buttons"`,
      },
      {
        title: 'Design the UI Components',
        content: `The AI will generate the UI components. Let's understand the structure:

- **TodoInput**: Input field and add button
- **TodoItem**: Individual todo with checkbox and delete
- **TodoList**: Container for all todo items

Ask the AI to make it beautiful: "Style the todo app with a clean, modern design using cards and subtle shadows"`,
        codeExample: {
          language: 'tsx',
          code: `interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

const TodoItem = ({ todo, onToggle, onDelete }: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
    <Checkbox 
      checked={todo.completed} 
      onCheckedChange={() => onToggle(todo.id)} 
    />
    <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
      {todo.text}
    </span>
    <Button variant="ghost" size="sm" onClick={() => onDelete(todo.id)}>
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);`,
          filename: 'TodoItem.tsx',
        },
      },
      {
        title: 'Set Up the Database',
        content: `Now let's persist our todos. Ask the AI:

> "Create a todos table in the database with columns for id, text, completed status, user_id, and timestamps. Add row-level security so users can only see their own todos."

The AI will create a database migration for you. Review and apply it.`,
        codeExample: {
          language: 'sql',
          code: `CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos
CREATE POLICY "Users can view own todos" 
  ON todos FOR SELECT 
  USING (auth.uid() = user_id);`,
          filename: 'migration.sql',
        },
        warning: 'Always enable Row Level Security (RLS) on tables that contain user data.',
      },
      {
        title: 'Add Authentication',
        content: `Users need to sign in to save their todos. Ask the AI:

> "Add authentication to the app with a sign in and sign up form. Redirect to the todo list after successful login."

The AI will create:
- Sign in/sign up forms
- Protected routes
- User session management`,
        tip: 'Enable email auto-confirm in development to skip email verification.',
      },
      {
        title: 'Connect to the Database',
        content: `Finally, wire everything together. Ask the AI:

> "Connect the todo app to the database. Fetch todos on load, add new todos to the database, update completed status, and delete todos."

The AI will use React Query to manage server state and provide real-time updates.`,
        codeExample: {
          language: 'tsx',
          code: `const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

const useAddTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase
        .from('todos')
        .insert({ text })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });
};`,
          filename: 'useTodos.ts',
        },
      },
    ],
    prevTutorial: 'getting-started',
    nextTutorial: 'deploying-your-first-app',
  },
  {
    id: '3',
    slug: 'deploying-your-first-app',
    title: 'Deploying Your First App',
    description: 'Learn how to deploy your application with one click, configure custom domains, and manage environments.',
    difficulty: 'Beginner',
    duration: '15 min',
    type: 'video',
    category: 'Deployment',
    icon: Rocket,
    prerequisites: [
      'A completed Kernel project',
      'Basic understanding of web hosting (optional)',
    ],
    whatYouWillLearn: [
      'Deploy your app with one click',
      'Configure a custom domain',
      'Set up environment variables',
      'Manage staging vs production',
    ],
    steps: [
      {
        title: 'Understanding Deployments',
        content: `Kernel makes deployment incredibly simple. When you click **Publish**, your app is built and deployed to our global edge network.

Key concepts:
- **Staging**: Preview URL for testing (yourapp.lovable.app)
- **Production**: Your custom domain (yourapp.com)
- **Edge Network**: Fast loading worldwide`,
        tip: 'Every deployment is instant and reversible.',
      },
      {
        title: 'One-Click Deploy',
        content: `To deploy your app:

1. Click the **"Publish"** button in the top right
2. Review the deployment preview
3. Click **"Update"** to go live

Your app will be built and deployed in seconds. You'll receive a unique URL like \`yourproject.lovable.app\`.`,
      },
      {
        title: 'Configure Custom Domain',
        content: `To use your own domain:

1. Go to **Project Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., myapp.com)
4. Add the DNS records to your domain provider

Kernel will automatically provision an SSL certificate.`,
        codeExample: {
          language: 'text',
          code: `DNS Configuration:
Type: CNAME
Name: www
Value: cname.lovable.app

Type: A
Name: @
Value: 76.76.21.21`,
          filename: 'dns-records.txt',
        },
        tip: 'DNS changes can take up to 48 hours to propagate, though usually it\'s much faster.',
      },
      {
        title: 'Environment Variables',
        content: `For production apps, you'll need environment variables for:
- API keys
- Database URLs
- Feature flags

Go to **Project Settings** → **Environment** to add secrets. These are encrypted and only available at runtime.`,
        warning: 'Never commit API keys or secrets to your code. Always use environment variables.',
      },
      {
        title: 'Deployment History & Rollbacks',
        content: `Every deployment is versioned. If something goes wrong:

1. Go to **Project Settings** → **Deployments**
2. Find a previous working version
3. Click **"Rollback"**

Your app will be reverted to the previous version instantly.`,
      },
    ],
    prevTutorial: 'building-todo-app',
    nextTutorial: 'building-responsive-layouts',
  },
  {
    id: '4',
    slug: 'building-responsive-layouts',
    title: 'Building Responsive Layouts',
    description: 'Master mobile-first design patterns and create layouts that look great on any device.',
    difficulty: 'Beginner',
    duration: '20 min',
    type: 'article',
    category: 'Design',
    icon: Palette,
    prerequisites: [
      'Basic understanding of HTML/CSS concepts',
      'Familiarity with the Kernel interface',
    ],
    whatYouWillLearn: [
      'Apply mobile-first design principles',
      'Use Tailwind CSS responsive breakpoints',
      'Create flexible grid and flex layouts',
      'Test across different screen sizes',
    ],
    steps: [
      {
        title: 'Mobile-First Approach',
        content: `Mobile-first means designing for small screens first, then adding complexity for larger screens.

In Tailwind CSS, unprefixed utilities apply to all sizes, while prefixed ones apply at that breakpoint and up:
- \`text-base\` → All sizes
- \`md:text-lg\` → Medium screens (768px+)
- \`lg:text-xl\` → Large screens (1024px+)`,
        codeExample: {
          language: 'tsx',
          code: `<h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

<div className="p-4 md:p-8 lg:p-12">
  Content with responsive padding
</div>`,
          filename: 'ResponsiveExample.tsx',
        },
      },
      {
        title: 'Responsive Grid Layouts',
        content: `Grids are perfect for card layouts. Change the number of columns based on screen size:`,
        codeExample: {
          language: 'tsx',
          code: `// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Auto-fit grid that adjusts based on available space
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
  {items.map(item => <Card key={item.id}>{item.title}</Card>)}
</div>`,
          filename: 'ResponsiveGrid.tsx',
        },
        tip: 'Use auto-fit with minmax() for truly flexible grids that don\'t need breakpoints.',
      },
      {
        title: 'Flexbox for Navigation',
        content: `Flexbox is great for navigation bars and horizontal layouts:`,
        codeExample: {
          language: 'tsx',
          code: `<nav className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
  <Logo />
  
  {/* Hidden on mobile, visible on desktop */}
  <div className="hidden md:flex items-center gap-6">
    <NavLink href="/features">Features</NavLink>
    <NavLink href="/pricing">Pricing</NavLink>
    <NavLink href="/docs">Docs</NavLink>
  </div>
  
  {/* Hamburger menu for mobile */}
  <button className="md:hidden">
    <Menu className="h-6 w-6" />
  </button>
</nav>`,
          filename: 'ResponsiveNav.tsx',
        },
      },
      {
        title: 'Container and Max-Width',
        content: `Contain your content to prevent it from stretching too wide on large screens:`,
        codeExample: {
          language: 'tsx',
          code: `// Centered container with responsive padding
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  <Content />
</div>

// Max-width for readable text
<article className="max-w-prose mx-auto">
  <p>Long form content stays readable at ~65 characters per line.</p>
</article>

// Different max-widths for different content
<div className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
  <Card />
</div>`,
          filename: 'ContainerExample.tsx',
        },
      },
      {
        title: 'Testing Responsive Design',
        content: `Always test your layouts at multiple sizes. In the Kernel preview:

1. **Drag the preview divider** to resize
2. Use browser DevTools (F12) → Toggle device toolbar
3. Test common breakpoints:
   - 375px (iPhone SE)
   - 768px (iPad)
   - 1024px (Small laptop)
   - 1440px (Desktop)

Ask the AI: "Make this component look better on mobile" if something doesn't work.`,
        tip: 'The preview panel can be resized to test responsive behavior without leaving Kernel.',
      },
    ],
    prevTutorial: 'deploying-your-first-app',
    nextTutorial: 'database-design-fundamentals',
  },

  // INTERMEDIATE TUTORIALS
  {
    id: '5',
    slug: 'database-design-fundamentals',
    title: 'Database Design Fundamentals',
    description: 'Learn how to design efficient database schemas for your applications with proper relationships.',
    difficulty: 'Intermediate',
    duration: '30 min',
    type: 'article',
    category: 'Database',
    icon: Database,
    prerequisites: [
      'Basic SQL knowledge',
      'Understanding of data types',
      'Completed beginner tutorials',
    ],
    whatYouWillLearn: [
      'Design normalized database schemas',
      'Create relationships between tables',
      'Use proper data types and constraints',
      'Implement row-level security',
    ],
    steps: [
      {
        title: 'Understanding Tables & Columns',
        content: `A well-designed database starts with understanding your data. Consider:

- **Entities**: What "things" does your app track? (users, posts, products)
- **Attributes**: What properties does each entity have?
- **Relationships**: How do entities relate to each other?

Example: A blog has Users, Posts, and Comments.`,
        codeExample: {
          language: 'sql',
          code: `-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`,
          filename: 'schema.sql',
        },
      },
      {
        title: 'Data Types & Constraints',
        content: `Choose the right data type for each column:

| Type | Use Case |
|------|----------|
| UUID | Primary keys, foreign keys |
| TEXT | Strings of any length |
| INTEGER | Whole numbers |
| NUMERIC | Money, precise decimals |
| BOOLEAN | True/false flags |
| TIMESTAMPTZ | Dates with timezone |
| JSONB | Flexible structured data |

Add constraints to ensure data integrity.`,
        codeExample: {
          language: 'sql',
          code: `CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);`,
          filename: 'products.sql',
        },
        tip: 'Use NUMERIC for money, never FLOAT (floating point has precision issues).',
      },
      {
        title: 'Relationships & Foreign Keys',
        content: `Tables relate to each other through foreign keys:

- **One-to-Many**: User has many Posts
- **Many-to-Many**: Posts have many Tags (needs junction table)
- **One-to-One**: User has one Profile`,
        codeExample: {
          language: 'sql',
          code: `-- One-to-Many: Posts belong to Users
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

-- Many-to-Many: Posts have Tags (junction table)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);`,
          filename: 'relationships.sql',
        },
        warning: 'Always consider ON DELETE behavior. CASCADE deletes related records, SET NULL keeps them.',
      },
      {
        title: 'Normalization Basics',
        content: `Normalization reduces data redundancy:

1. **1NF**: No repeating groups (don't store arrays as comma-separated strings)
2. **2NF**: Every non-key column depends on the whole primary key
3. **3NF**: No transitive dependencies (column depends only on the key)

Bad: Storing "author_name" on every post
Good: Reference author_id and join to get the name`,
        codeExample: {
          language: 'sql',
          code: `-- BAD: Denormalized (data duplication)
CREATE TABLE orders_bad (
  id UUID PRIMARY KEY,
  customer_name TEXT,  -- Duplicated for every order!
  customer_email TEXT, -- Duplicated for every order!
  product_name TEXT,
  quantity INTEGER
);

-- GOOD: Normalized (reference by ID)
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE orders_good (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL
);`,
          filename: 'normalization.sql',
        },
      },
      {
        title: 'Row Level Security (RLS)',
        content: `RLS ensures users can only access their own data. Always enable it for user data!`,
        codeExample: {
          language: 'sql',
          code: `-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can read published posts
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (published = true);

-- Users can read their own drafts
CREATE POLICY "Authors can read own drafts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

-- Only authors can update their posts
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Only authors can delete their posts
CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);`,
          filename: 'rls-policies.sql',
        },
        warning: 'Without RLS, all authenticated users can see all data in a table.',
      },
    ],
    prevTutorial: 'building-responsive-layouts',
    nextTutorial: 'working-with-database-panel',
  },
  {
    id: '6',
    slug: 'working-with-database-panel',
    title: 'Working with the Database Panel',
    description: 'Master the Database Panel to create tables, manage records, and visualize relationships.',
    difficulty: 'Intermediate',
    duration: '25 min',
    type: 'video',
    category: 'Database',
    icon: Database,
    popular: true,
    prerequisites: [
      'Completed "Database Design Fundamentals"',
      'A Kernel project with Cloud enabled',
    ],
    whatYouWillLearn: [
      'Navigate the Database Panel interface',
      'Create and modify tables visually',
      'Add, edit, and delete records',
      'View table relationships',
    ],
    steps: [
      {
        title: 'Accessing the Database Panel',
        content: `The Database Panel is your visual interface for managing data:

1. Open your project in the Builder
2. Click the **"Cloud"** tab in the right panel
3. Select **"Database"** from the submenu

You'll see a list of all your tables and can explore the schema.`,
      },
      {
        title: 'Creating Tables',
        content: `To create a table without writing SQL:

1. Click **"New Table"**
2. Enter the table name
3. Add columns with types and constraints
4. Enable RLS if the table contains user data
5. Click **"Create"**

The panel generates the SQL migration for you.`,
        codeExample: {
          language: 'typescript',
          code: `// After creating a table, you can query it:
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Insert a record
const { data, error } = await supabase
  .from('your_table')
  .insert({ column1: 'value1', column2: 'value2' })
  .select()
  .single();`,
          filename: 'query-example.ts',
        },
      },
      {
        title: 'Managing Records',
        content: `The Table View shows all records in a spreadsheet-like interface:

- **Add Row**: Click the "+" button to add a new record
- **Edit**: Click any cell to edit inline
- **Delete**: Select rows and click delete
- **Filter**: Use the filter bar to find specific records
- **Sort**: Click column headers to sort

Changes are saved immediately to the database.`,
        tip: 'Use filters to find specific records quickly in large tables.',
      },
      {
        title: 'Viewing Relationships',
        content: `The Schema Viewer shows how tables relate:

1. Click **"Schema"** tab in the Database Panel
2. View the entity-relationship diagram
3. See foreign key connections between tables
4. Click a table to see its columns and constraints

This helps you understand your data model at a glance.`,
      },
      {
        title: 'Common Operations',
        content: `Here are SQL equivalents for common panel operations:`,
        codeExample: {
          language: 'sql',
          code: `-- Add a column
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';

-- Remove a column
ALTER TABLE products DROP COLUMN old_column;

-- Add an index for faster queries
CREATE INDEX idx_products_category ON products(category);

-- Rename a table
ALTER TABLE old_name RENAME TO new_name;`,
          filename: 'common-operations.sql',
        },
        warning: 'Dropping columns or tables is irreversible. Always backup important data first.',
      },
    ],
    prevTutorial: 'database-design-fundamentals',
    nextTutorial: 'implementing-authentication',
  },
  {
    id: '7',
    slug: 'implementing-authentication',
    title: 'Implementing User Authentication',
    description: 'Set up secure authentication with email, social login, and role-based access control.',
    difficulty: 'Intermediate',
    duration: '30 min',
    type: 'video',
    category: 'Authentication',
    icon: Shield,
    popular: true,
    prerequisites: [
      'Completed database tutorials',
      'Understanding of HTTP and sessions',
    ],
    whatYouWillLearn: [
      'Set up email/password authentication',
      'Add social login providers',
      'Create protected routes',
      'Implement role-based access control',
    ],
    steps: [
      {
        title: 'Authentication Overview',
        content: `Kernel uses secure, built-in authentication. The flow is:

1. User signs up with email or social provider
2. User receives a session token (JWT)
3. Token is stored in the browser
4. All API requests include the token
5. Backend validates and identifies the user

No need to build auth from scratch!`,
      },
      {
        title: 'Email/Password Setup',
        content: `Ask the AI to create auth forms:

> "Create a sign-in page with email and password fields, and a sign-up page with password confirmation. Add forgot password functionality."

The AI will generate:`,
        codeExample: {
          language: 'tsx',
          code: `const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn}>
      <Input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" 
      />
      <Input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password" 
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};`,
          filename: 'SignInForm.tsx',
        },
        tip: 'Enable auto-confirm in development to skip email verification.',
      },
      {
        title: 'Social Login Providers',
        content: `Add Google, GitHub, or other social logins:`,
        codeExample: {
          language: 'tsx',
          code: `const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: \`\${window.location.origin}/auth/callback\`,
    },
  });
  
  if (error) {
    toast.error(error.message);
  }
};

// In your component
<Button variant="outline" onClick={handleGoogleSignIn}>
  <GoogleIcon className="mr-2 h-4 w-4" />
  Continue with Google
</Button>`,
          filename: 'SocialAuth.tsx',
        },
      },
      {
        title: 'Protected Routes',
        content: `Prevent unauthenticated users from accessing certain pages:`,
        codeExample: {
          language: 'tsx',
          code: `const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : null;
};

// Usage in App.tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>`,
          filename: 'ProtectedRoute.tsx',
        },
      },
      {
        title: 'Role-Based Access Control',
        content: `For apps with admins, moderators, etc., create a roles table:`,
        codeExample: {
          language: 'sql',
          code: `-- Create user roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Function to check if user has a role
CREATE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in RLS policies
CREATE POLICY "Admins can do anything"
  ON posts FOR ALL
  USING (has_role('admin'));`,
          filename: 'rbac.sql',
        },
        warning: 'Always check roles server-side (RLS/edge functions). Never trust client-side role checks alone.',
      },
    ],
    prevTutorial: 'working-with-database-panel',
    nextTutorial: 'integrating-external-apis',
  },
  {
    id: '8',
    slug: 'integrating-external-apis',
    title: 'Integrating External APIs',
    description: 'Connect to third-party APIs using Edge Functions with proper error handling and rate limiting.',
    difficulty: 'Intermediate',
    duration: '35 min',
    type: 'video',
    category: 'Integration',
    icon: Zap,
    prerequisites: [
      'Understanding of REST APIs',
      'Basic TypeScript knowledge',
      'Kernel project with Cloud enabled',
    ],
    whatYouWillLearn: [
      'Create Edge Functions for API calls',
      'Securely store API keys',
      'Handle errors and retries',
      'Implement rate limiting',
    ],
    steps: [
      {
        title: 'Why Edge Functions?',
        content: `Never call external APIs directly from the frontend because:

- **Security**: API keys would be exposed in browser
- **CORS**: Many APIs don't allow browser requests
- **Rate Limiting**: Hard to control from client
- **Secrets**: Environment variables not available in browser

Edge Functions run on the server, solving all these issues.`,
      },
      {
        title: 'Creating an Edge Function',
        content: `Ask the AI to create an edge function:

> "Create an edge function that fetches weather data from OpenWeatherMap API and returns it in a simplified format"`,
        codeExample: {
          language: 'typescript',
          code: `// supabase/functions/get-weather/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { city } = await req.json()
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    
    const response = await fetch(
      \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${apiKey}&units=metric\`
    )
    
    if (!response.ok) {
      throw new Error('Weather API error')
    }
    
    const data = await response.json()
    
    return new Response(JSON.stringify({
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})`,
          filename: 'get-weather/index.ts',
        },
      },
      {
        title: 'Storing API Keys Securely',
        content: `Never hardcode API keys! Use environment secrets:

1. Go to Project Settings → Cloud → Secrets
2. Add your API key (e.g., OPENWEATHER_API_KEY)
3. Access it in the function with Deno.env.get()

Secrets are encrypted and only available at runtime.`,
        warning: 'If you accidentally commit an API key, revoke it immediately and generate a new one.',
      },
      {
        title: 'Calling Edge Functions',
        content: `From your frontend, call the edge function:`,
        codeExample: {
          language: 'typescript',
          code: `const getWeather = async (city: string) => {
  const { data, error } = await supabase.functions.invoke('get-weather', {
    body: { city },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Usage with React Query
const useWeather = (city: string) => {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => getWeather(city),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};`,
          filename: 'useWeather.ts',
        },
        tip: 'Use React Query to cache API responses and reduce unnecessary calls.',
      },
      {
        title: 'Error Handling & Retries',
        content: `Robust error handling makes your app reliable:`,
        codeExample: {
          language: 'typescript',
          code: `const fetchWithRetry = async (
  url: string, 
  options: RequestInit, 
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = response.headers.get('Retry-After') || '1';
        await new Promise(r => setTimeout(r, parseInt(retryAfter) * 1000));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
};`,
          filename: 'fetchWithRetry.ts',
        },
      },
    ],
    prevTutorial: 'implementing-authentication',
    nextTutorial: 'creating-custom-design-systems',
  },
  {
    id: '9',
    slug: 'creating-custom-design-systems',
    title: 'Creating Custom Design Systems',
    description: 'Build a cohesive design system with custom themes, colors, typography, and reusable components.',
    difficulty: 'Intermediate',
    duration: '35 min',
    type: 'article',
    category: 'Design',
    icon: Palette,
    prerequisites: [
      'Understanding of CSS and Tailwind',
      'Familiarity with component-based design',
    ],
    whatYouWillLearn: [
      'Define a color palette with CSS variables',
      'Create typography scales',
      'Build reusable component variants',
      'Implement dark mode support',
    ],
    steps: [
      {
        title: 'Why Design Systems Matter',
        content: `A design system ensures consistency across your app:

- **Consistency**: Same colors, spacing, typography everywhere
- **Speed**: Reuse components instead of rebuilding
- **Maintainability**: Change once, update everywhere
- **Collaboration**: Team knows what components exist

Kernel uses CSS variables and Tailwind for theming.`,
      },
      {
        title: 'Defining Colors',
        content: `Define your color palette in index.css using HSL values:`,
        codeExample: {
          language: 'css',
          code: `:root {
  /* Brand Colors */
  --primary: 222 47% 50%;
  --primary-foreground: 0 0% 100%;
  
  /* Semantic Colors */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  
  /* Accents */
  --accent: 210 40% 90%;
  --accent-foreground: 222 47% 11%;
  
  /* Feedback Colors */
  --destructive: 0 84% 60%;
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
}

.dark {
  --background: 222 47% 5%;
  --foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  /* ... dark mode overrides */
}`,
          filename: 'index.css',
        },
        tip: 'Use HSL colors for easy adjustments. Change just the lightness to create variants.',
      },
      {
        title: 'Typography Scale',
        content: `Define consistent font sizes and weights:`,
        codeExample: {
          language: 'javascript',
          code: `// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
    },
  },
}`,
          filename: 'tailwind.config.ts',
        },
      },
      {
        title: 'Component Variants',
        content: `Use class-variance-authority (CVA) for component variants:`,
        codeExample: {
          language: 'tsx',
          code: `import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = ({ variant, size, className, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);`,
          filename: 'Button.tsx',
        },
      },
      {
        title: 'Dark Mode Support',
        content: `Kernel includes dark mode out of the box:`,
        codeExample: {
          language: 'tsx',
          code: `import { useTheme } from 'next-themes';

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
    </Button>
  );
};

// Your CSS variables automatically switch based on .dark class
// Tailwind's dark: prefix also works
<div className="bg-background text-foreground dark:bg-slate-950">
  Content adapts to theme
</div>`,
          filename: 'ThemeToggle.tsx',
        },
        tip: 'Test both themes regularly to catch contrast and readability issues.',
      },
    ],
    prevTutorial: 'integrating-external-apis',
    nextTutorial: 'ai-powered-development',
  },
  {
    id: '10',
    slug: 'ai-powered-development',
    title: 'AI-Powered Development',
    description: 'Master AI prompts and code generation to build applications faster with smart suggestions.',
    difficulty: 'Intermediate',
    duration: '40 min',
    type: 'video',
    category: 'AI',
    icon: Zap,
    popular: true,
    prerequisites: [
      'Completed beginner tutorials',
      'Basic understanding of React components',
    ],
    whatYouWillLearn: [
      'Write effective prompts for code generation',
      'Use context to improve AI responses',
      'Iterate on AI-generated code',
      'Debug with AI assistance',
    ],
    steps: [
      {
        title: 'The Art of Prompting',
        content: `Good prompts lead to good code. Be specific about:

- **What**: The exact feature you want
- **How**: Any specific approach or library
- **Style**: Design preferences
- **Context**: Related existing code

**Bad prompt**: "Add a form"
**Good prompt**: "Create a contact form with name, email, and message fields. Use the existing Card component for styling. Add validation and show a success toast on submit."`,
      },
      {
        title: 'Providing Context',
        content: `The AI works better with context. Share:

- Existing component patterns
- Database schema information
- Design system tokens
- Error messages you're seeing

You can reference files: "Update the UserCard component from src/components/UserCard.tsx to include the user's avatar"`,
        codeExample: {
          language: 'text',
          code: `Example prompt with context:

"I have a todos table with columns (id, text, completed, user_id). 
Create a hook called useTodos that:
- Fetches all todos for the current user
- Provides addTodo, toggleTodo, and deleteTodo mutations
- Uses React Query for caching
- Follows the same pattern as useAuth hook"`,
          filename: 'prompt-example.txt',
        },
        tip: 'The more specific you are, the less you\'ll need to iterate.',
      },
      {
        title: 'Iterative Development',
        content: `Build incrementally:

1. Start with the basic structure
2. Ask for specific improvements
3. Refine styling
4. Add edge cases

**Example flow**:
1. "Create a user profile page with avatar, name, and bio"
2. "Add an edit mode with a form to update the profile"
3. "Make the avatar upload work with drag and drop"
4. "Add loading and error states"`,
      },
      {
        title: 'Debugging with AI',
        content: `When things break, share the error:

> "I'm getting this error: TypeError: Cannot read property 'map' of undefined at ProductList.tsx:23. Here's my code: [paste code]. The API returns products but they're not rendering."

The AI can:
- Identify the bug
- Explain why it happened
- Provide the fix
- Suggest how to prevent it`,
        codeExample: {
          language: 'tsx',
          code: `// Common issue: data not ready yet
const ProductList = () => {
  const { data: products } = useProducts();
  
  // ❌ This crashes if products is undefined
  return products.map(p => <Product key={p.id} {...p} />);
  
  // ✅ Handle loading state
  return products?.map(p => <Product key={p.id} {...p} />) ?? <Loading />;
};`,
          filename: 'debugging-example.tsx',
        },
      },
      {
        title: 'Advanced Techniques',
        content: `Level up your AI usage:

**Multi-file changes**: "Refactor the auth logic from AuthContext.tsx into a custom hook useAuth.ts and update all components that use it"

**Code review**: "Review this component for performance issues and suggest improvements"

**Learning**: "Explain how React Query's staleTime and cacheTime work with an example"

**Best practices**: "Is there a better way to handle form validation in this component?"`,
        tip: 'Ask "why" questions to understand the code better, not just "what" to build.',
      },
    ],
    prevTutorial: 'creating-custom-design-systems',
    nextTutorial: 'advanced-state-management',
  },

  // ADVANCED TUTORIALS
  {
    id: '11',
    slug: 'advanced-state-management',
    title: 'Advanced State Management',
    description: 'Learn patterns for managing complex application state with React Query and custom hooks.',
    difficulty: 'Advanced',
    duration: '45 min',
    type: 'article',
    category: 'Development',
    icon: Code,
    prerequisites: [
      'Strong React fundamentals',
      'Experience with hooks',
      'Understanding of async patterns',
    ],
    whatYouWillLearn: [
      'Structure application state effectively',
      'Master React Query for server state',
      'Create powerful custom hooks',
      'Optimize re-renders',
    ],
    steps: [
      {
        title: 'State Categories',
        content: `Not all state is equal. Categorize yours:

| Type | Example | Tool |
|------|---------|------|
| **Server State** | User data, posts | React Query |
| **Client State** | UI state, forms | useState/useReducer |
| **URL State** | Filters, pagination | URL params |
| **Form State** | Input values | React Hook Form |

Use the right tool for each type.`,
      },
      {
        title: 'React Query Deep Dive',
        content: `React Query handles server state brilliantly:`,
        codeExample: {
          language: 'tsx',
          code: `// Configure defaults for the whole app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom hook with all the bells and whistles
const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData, // Keep old data while fetching new
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  });
};

// Mutation with optimistic updates
const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['products']);
      
      // Optimistically update
      queryClient.setQueryData(['products'], (old: Product[]) =>
        old.map(p => p.id === newProduct.id ? newProduct : p)
      );
      
      return { previous };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(['products'], context?.previous);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};`,
          filename: 'react-query-patterns.tsx',
        },
      },
      {
        title: 'Custom Hook Patterns',
        content: `Extract complex logic into reusable hooks:`,
        codeExample: {
          language: 'tsx',
          code: `// Composition: Combine multiple hooks
const useProductPage = (productId: string) => {
  const product = useProduct(productId);
  const reviews = useReviews(productId);
  const relatedProducts = useRelatedProducts(productId);
  
  return {
    product,
    reviews,
    relatedProducts,
    isLoading: product.isLoading || reviews.isLoading,
    hasError: product.isError || reviews.isError,
  };
};

// Encapsulation: Hide implementation details
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Usage: Search with debounce
const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results } = useProductSearch(debouncedQuery);
  
  return (
    <>
      <Input value={query} onChange={e => setQuery(e.target.value)} />
      <ProductList products={results} />
    </>
  );
};`,
          filename: 'custom-hooks.tsx',
        },
      },
      {
        title: 'Preventing Unnecessary Re-renders',
        content: `Optimize performance with careful state management:`,
        codeExample: {
          language: 'tsx',
          code: `// Split state to minimize re-renders
const ProductPage = () => {
  // Bad: One big state object
  // const [state, setState] = useState({ product, reviews, cart });
  
  // Good: Separate concerns
  const product = useProduct(id);
  const reviews = useReviews(id);
  const [cartOpen, setCartOpen] = useState(false);
  
  return (
    <>
      {/* Only re-renders when product changes */}
      <ProductInfo product={product.data} />
      
      {/* Only re-renders when reviews change */}
      <Reviews reviews={reviews.data} />
      
      {/* Only re-renders when cart state changes */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

// Memoize expensive computations
const ProductList = ({ products, filter }: Props) => {
  const filteredProducts = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  );
  
  return filteredProducts.map(p => <ProductCard key={p.id} product={p} />);
};

// Memoize callbacks passed to children
const ParentComponent = () => {
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return <ChildComponent onClick={handleClick} />;
};`,
          filename: 'optimization.tsx',
        },
        tip: 'Use React DevTools Profiler to identify unnecessary re-renders.',
      },
      {
        title: 'State Machines for Complex Flows',
        content: `For multi-step processes, consider state machines:`,
        codeExample: {
          language: 'tsx',
          code: `type CheckoutState = 
  | { status: 'cart' }
  | { status: 'shipping'; cartId: string }
  | { status: 'payment'; cartId: string; addressId: string }
  | { status: 'confirmation'; orderId: string }
  | { status: 'error'; message: string };

type CheckoutAction =
  | { type: 'PROCEED_TO_SHIPPING'; cartId: string }
  | { type: 'PROCEED_TO_PAYMENT'; addressId: string }
  | { type: 'COMPLETE_ORDER'; orderId: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

const checkoutReducer = (
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState => {
  switch (action.type) {
    case 'PROCEED_TO_SHIPPING':
      if (state.status !== 'cart') return state;
      return { status: 'shipping', cartId: action.cartId };
    
    case 'PROCEED_TO_PAYMENT':
      if (state.status !== 'shipping') return state;
      return { status: 'payment', cartId: state.cartId, addressId: action.addressId };
    
    case 'COMPLETE_ORDER':
      if (state.status !== 'payment') return state;
      return { status: 'confirmation', orderId: action.orderId };
    
    case 'ERROR':
      return { status: 'error', message: action.message };
    
    case 'RESET':
      return { status: 'cart' };
    
    default:
      return state;
  }
};`,
          filename: 'checkout-state-machine.tsx',
        },
      },
    ],
    prevTutorial: 'ai-powered-development',
    nextTutorial: 'building-realtime-applications',
  },
  {
    id: '12',
    slug: 'building-realtime-applications',
    title: 'Building Real-time Applications',
    description: 'Create live-updating features with real-time database subscriptions and presence indicators.',
    difficulty: 'Advanced',
    duration: '50 min',
    type: 'video',
    category: 'Database',
    icon: Database,
    prerequisites: [
      'Completed database tutorials',
      'Understanding of WebSockets',
      'React Query experience',
    ],
    whatYouWillLearn: [
      'Subscribe to database changes',
      'Build real-time chat',
      'Implement presence indicators',
      'Handle connection states',
    ],
    steps: [
      {
        title: 'Real-time Overview',
        content: `Real-time features update instantly without refreshing:

- **Chat messages**: Appear immediately
- **Notifications**: Pop up as they happen
- **Collaborative editing**: See others' changes live
- **Presence**: Know who's online

Kernel uses database subscriptions via WebSockets.`,
      },
      {
        title: 'Enabling Real-time',
        content: `First, enable real-time on your table:`,
        codeExample: {
          language: 'sql',
          code: `-- Add table to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- For existing tables, you may need:
-- DROP PUBLICATION IF EXISTS supabase_realtime;
-- CREATE PUBLICATION supabase_realtime FOR TABLE messages, notifications;`,
          filename: 'enable-realtime.sql',
        },
        warning: 'Only enable real-time on tables that need it. Each subscription uses server resources.',
      },
      {
        title: 'Subscribing to Changes',
        content: `Listen for database changes in real-time:`,
        codeExample: {
          language: 'tsx',
          code: `const useRealtimeMessages = (channelId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(\`messages:\${channelId}\`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'messages',
          filter: \`channel_id=eq.\${channelId}\`,
        },
        (payload) => {
          // Update cache based on event type
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(
              ['messages', channelId],
              (old: Message[] = []) => [...old, payload.new as Message]
            );
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(
              ['messages', channelId],
              (old: Message[] = []) => 
                old.filter(m => m.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);
};`,
          filename: 'useRealtimeMessages.tsx',
        },
      },
      {
        title: 'Building Real-time Chat',
        content: `A complete chat implementation:`,
        codeExample: {
          language: 'tsx',
          code: `const ChatRoom = ({ roomId }: { roomId: string }) => {
  const { user } = useAuth();
  const { data: messages = [] } = useMessages(roomId);
  const sendMessage = useSendMessage(roomId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time updates
  useRealtimeMessages(roomId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage.mutateAsync(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isOwn={message.user_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit" disabled={sendMessage.isPending}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};`,
          filename: 'ChatRoom.tsx',
        },
      },
      {
        title: 'Presence Indicators',
        content: `Show who's online and what they're doing:`,
        codeExample: {
          language: 'tsx',
          code: `const usePresence = (roomId: string) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel(\`presence:\${roomId}\`, {
      config: { presence: { key: user?.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as PresenceUser[];
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            user_name: user?.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, user]);

  return onlineUsers;
};

// Usage
const OnlineUsers = ({ roomId }: { roomId: string }) => {
  const onlineUsers = usePresence(roomId);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {onlineUsers.map((user) => (
          <Avatar key={user.user_id}>
            <AvatarFallback>{user.user_name?.[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {onlineUsers.length} online
      </span>
    </div>
  );
};`,
          filename: 'usePresence.tsx',
        },
      },
      {
        title: 'Connection State Handling',
        content: `Handle disconnections gracefully:`,
        codeExample: {
          language: 'tsx',
          code: `const useConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel.subscribe((status) => {
      switch (status) {
        case 'SUBSCRIBED':
          setStatus('connected');
          break;
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
        case 'CLOSED':
          setStatus('disconnected');
          break;
        default:
          setStatus('connecting');
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return status;
};

// Show connection status to user
const ConnectionIndicator = () => {
  const status = useConnectionStatus();

  if (status === 'connected') return null;

  return (
    <div className={cn(
      'fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm',
      status === 'connecting' && 'bg-yellow-500 text-yellow-50',
      status === 'disconnected' && 'bg-red-500 text-red-50'
    )}>
      {status === 'connecting' ? 'Reconnecting...' : 'Connection lost'}
    </div>
  );
};`,
          filename: 'ConnectionStatus.tsx',
        },
        tip: 'Always inform users about connection issues so they know their changes might not save.',
      },
    ],
    prevTutorial: 'advanced-state-management',
  },
];

// Helper function to get tutorial by slug
export const getTutorialBySlug = (slug: string): Tutorial | undefined => {
  return tutorials.find(t => t.slug === slug);
};

// Helper function to get related tutorials
export const getRelatedTutorials = (currentTutorial: Tutorial, limit = 3): Tutorial[] => {
  return tutorials
    .filter(t => 
      t.id !== currentTutorial.id && 
      (t.category === currentTutorial.category || t.difficulty === currentTutorial.difficulty)
    )
    .slice(0, limit);
};
