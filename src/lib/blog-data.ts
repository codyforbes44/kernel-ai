export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
    role: string;
  };
  date: string;
  readTime: string;
  featured?: boolean;
  tags?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'introducing-ai-powered-code-generation',
    title: 'Introducing AI-Powered Code Generation',
    excerpt: 'Learn how our new AI features can help you write code faster and more efficiently than ever before.',
    content: `
## The Future of Development is Here

We're excited to announce the launch of our AI-powered code generation features, designed to help you build applications faster than ever before.

### What's New?

Our AI understands context. It doesn't just generate code snippets—it understands your entire project structure, your design system, and your coding patterns.

**Key Features:**
- **Context-Aware Generation**: The AI reads your existing code and generates new code that matches your style
- **Smart Refactoring**: Automatically improve code quality while maintaining functionality
- **Error Detection**: Catch bugs before they happen with intelligent analysis

### How It Works

When you describe what you want to build, our AI:

1. Analyzes your existing codebase
2. Understands your component patterns
3. Generates code that fits seamlessly

\`\`\`typescript
// Example: Just describe what you need
"Create a user profile card with avatar, name, and email"

// AI generates complete, styled component
const UserProfileCard = ({ user }) => {
  return (
    <Card className="p-4">
      <Avatar src={user.avatar} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </Card>
  );
};
\`\`\`

### Getting Started

Try it today by opening any project and describing what you want to build. The AI will handle the rest.

We're just getting started. Stay tuned for more updates as we continue to push the boundaries of what's possible with AI-assisted development.
    `,
    category: 'Product',
    author: { name: 'Sarah Chen', initials: 'SC', role: 'Head of Product' },
    date: 'December 18, 2024',
    readTime: '5 min read',
    featured: true,
    tags: ['AI', 'Product Update', 'Code Generation'],
  },
  {
    id: '2',
    slug: 'best-practices-for-building-scalable-applications',
    title: 'Best Practices for Building Scalable Applications',
    excerpt: 'Discover the architectural patterns and strategies that will help your application grow with your users.',
    content: `
## Building for Scale from Day One

When building applications, it's tempting to focus solely on features. But thinking about scale early can save you countless hours of refactoring later.

### Architecture Patterns That Scale

**1. Component-Based Architecture**

Break your UI into small, reusable components. Each component should have a single responsibility.

**2. State Management**

Choose the right state management solution for your needs:
- Local state for component-specific data
- Context for shared state across a subtree
- Global state management for app-wide data

**3. API Design**

Design your APIs to be:
- Consistent in naming and structure
- Paginated for large datasets
- Cached appropriately

### Database Considerations

- Use indexes strategically
- Implement row-level security
- Plan for data partitioning early

### Performance Tips

1. Lazy load components and routes
2. Optimize images and assets
3. Implement proper caching strategies
4. Use CDNs for static assets

### Monitoring and Observability

You can't improve what you don't measure. Set up:
- Error tracking
- Performance monitoring
- User analytics

Building scalable applications is a journey, not a destination. Start with these fundamentals and iterate as you learn more about your users' needs.
    `,
    category: 'Engineering',
    author: { name: 'Alex Rivera', initials: 'AR', role: 'Senior Engineer' },
    date: 'December 15, 2024',
    readTime: '8 min read',
    tags: ['Architecture', 'Performance', 'Best Practices'],
  },
  {
    id: '3',
    slug: 'the-future-of-no-code-development',
    title: 'The Future of No-Code Development',
    excerpt: 'Exploring how AI and visual development tools are changing the way we build software.',
    content: `
## A New Era of Software Development

The line between "developers" and "non-developers" is blurring. AI and visual development tools are democratizing software creation.

### The No-Code Revolution

No-code doesn't mean no skill. It means different skills. Visual thinking, system design, and problem-solving are more important than ever.

### AI as a Collaborator

Modern AI tools don't replace developers—they amplify them:
- **Speed**: Build in hours what used to take days
- **Quality**: AI catches errors humans miss
- **Learning**: AI explains its choices, teaching as it builds

### What This Means for Developers

The role of developers is evolving:
- Less time on boilerplate, more time on innovation
- Focus shifts to architecture and user experience
- Collaboration with AI becomes a core skill

### The Path Forward

The future isn't about code vs. no-code. It's about using the right tools for the job. Sometimes that's writing code. Sometimes it's describing what you want and letting AI figure out the details.

Embrace the change. The developers who thrive will be those who learn to work with AI, not against it.
    `,
    category: 'Industry',
    author: { name: 'Jordan Taylor', initials: 'JT', role: 'Tech Writer' },
    date: 'December 12, 2024',
    readTime: '6 min read',
    tags: ['No-Code', 'AI', 'Future of Work'],
  },
  {
    id: '4',
    slug: 'designing-for-dark-mode-complete-guide',
    title: 'Designing for Dark Mode: A Complete Guide',
    excerpt: 'Everything you need to know about implementing beautiful dark mode experiences in your applications.',
    content: `
## Why Dark Mode Matters

Dark mode isn't just a preference—it's an accessibility feature. It reduces eye strain, saves battery on OLED screens, and looks stunning when done right.

### Design Principles

**1. Don't Just Invert Colors**

A good dark theme is carefully crafted, not automatically generated:
- Use dark grays instead of pure black
- Reduce contrast slightly to prevent eye strain
- Adjust color saturation for dark backgrounds

**2. Semantic Color Tokens**

Use CSS variables for all colors:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
}

.dark {
  --background: 0 0% 9%;
  --foreground: 0 0% 98%;
}
\`\`\`

**3. Elevation Through Color**

In dark mode, use lighter shades to indicate elevation instead of shadows.

### Implementation Tips

- Always test both themes during development
- Respect system preferences
- Provide a manual toggle
- Persist user preference

### Common Mistakes

1. Pure black backgrounds (#000)
2. Same color palette for both themes
3. Forgetting about images and illustrations
4. Not testing with actual users

Dark mode done right enhances your entire application. Take the time to craft it carefully.
    `,
    category: 'Design',
    author: { name: 'Morgan Lee', initials: 'ML', role: 'Design Lead' },
    date: 'December 8, 2024',
    readTime: '7 min read',
    tags: ['Design', 'Dark Mode', 'UI/UX'],
  },
  {
    id: '5',
    slug: 'securing-your-application-authentication-best-practices',
    title: 'Securing Your Application: Authentication Best Practices',
    excerpt: 'A comprehensive guide to implementing secure authentication in modern web applications.',
    content: `
## Security is Not Optional

In today's landscape, security breaches are common and costly. Proper authentication is your first line of defense.

### Authentication Fundamentals

**Never Store Passwords in Plain Text**

Always hash passwords with a strong algorithm like bcrypt or Argon2.

**Use HTTPS Everywhere**

All authentication requests must use HTTPS. No exceptions.

**Implement Rate Limiting**

Prevent brute force attacks by limiting login attempts.

### Modern Authentication Patterns

**1. OAuth 2.0 / OpenID Connect**

Let trusted providers handle authentication:
- Google, GitHub, Microsoft
- Reduces your security surface area
- Better user experience

**2. Multi-Factor Authentication**

Add a second layer of security:
- TOTP apps (Google Authenticator)
- SMS (less secure but better than nothing)
- Hardware keys (most secure)

**3. Session Management**

- Use secure, httpOnly cookies
- Implement proper session expiration
- Allow users to view and revoke sessions

### Row-Level Security

Don't trust the client. Implement database-level security:

\`\`\`sql
CREATE POLICY "Users can only see their own data"
ON public.user_data
FOR SELECT
USING (auth.uid() = user_id);
\`\`\`

### Security Checklist

- [ ] Passwords hashed with strong algorithm
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting on auth endpoints
- [ ] MFA option available
- [ ] Secure session management
- [ ] RLS policies on all user data

Security is an ongoing process. Stay updated on best practices and regularly audit your implementation.
    `,
    category: 'Security',
    author: { name: 'Chris Park', initials: 'CP', role: 'Security Engineer' },
    date: 'December 5, 2024',
    readTime: '10 min read',
    tags: ['Security', 'Authentication', 'Best Practices'],
  },
  {
    id: '6',
    slug: 'how-we-reduced-build-times-by-60-percent',
    title: 'How We Reduced Build Times by 60%',
    excerpt: 'An inside look at the optimizations we made to dramatically improve our build performance.',
    content: `
## The Problem

Our build times had crept up to over 3 minutes. For a tool focused on speed, this was unacceptable.

### Identifying the Bottlenecks

We started by profiling our build process:

1. **TypeScript compilation**: 45 seconds
2. **Bundle generation**: 60 seconds
3. **Asset optimization**: 35 seconds
4. **Other tasks**: 40 seconds

### The Optimizations

**1. Parallel Processing**

We restructured our build to run independent tasks in parallel.

**2. Incremental Builds**

Instead of rebuilding everything, we now only rebuild what changed.

**3. Caching**

Aggressive caching of:
- Compiled TypeScript
- Transformed assets
- Dependency graphs

**4. Tree Shaking Improvements**

Better dead code elimination reduced bundle sizes by 30%.

### Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Full Build | 180s | 72s | 60% faster |
| Incremental | 45s | 8s | 82% faster |
| Bundle Size | 2.4MB | 1.7MB | 29% smaller |

### Key Takeaways

1. Measure before optimizing
2. Parallelize everything possible
3. Cache aggressively
4. Small wins compound

Performance optimization is never done, but these changes have dramatically improved our developer experience.
    `,
    category: 'Engineering',
    author: { name: 'Sam Wilson', initials: 'SW', role: 'Platform Engineer' },
    date: 'December 1, 2024',
    readTime: '6 min read',
    tags: ['Performance', 'Engineering', 'DevOps'],
  },
];

export const categoryColors: Record<string, string> = {
  Product: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Engineering: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Industry: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Design: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  Security: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit = 3): BlogPost[] => {
  const currentPost = getBlogPostBySlug(currentSlug);
  if (!currentPost) return [];
  
  return blogPosts
    .filter(post => post.slug !== currentSlug)
    .filter(post => post.category === currentPost.category || 
      post.tags?.some(tag => currentPost.tags?.includes(tag)))
    .slice(0, limit);
};
