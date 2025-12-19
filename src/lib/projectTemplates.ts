// Project template definitions for the builder

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  files: TemplateFile[];
}

export interface TemplateFile {
  path: string;
  name: string;
  type: 'file' | 'folder';
  language: string | null;
  is_entry_point: boolean;
  content: string | null;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with a minimal React setup',
    icon: '📄',
    color: '#6366f1',
    files: [
      {
        path: '/src/App.tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: true,
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Hello World!</h1>
      <p>Start editing to see changes.</p>
    </div>
  );
}

export default App;
`,
      },
      {
        path: '/src/App.css',
        name: 'App.css',
        type: 'file',
        language: 'css',
        is_entry_point: false,
        content: `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  opacity: 0.9;
}
`,
      },
      {
        path: '/src/main.tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: false,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: '/index.html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        is_entry_point: false,
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
    ],
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern landing page with hero, features, and CTA sections',
    icon: '🚀',
    color: '#8b5cf6',
    files: [
      {
        path: '/src/App.tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: true,
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-brand">✨ MyApp</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Build something amazing</h1>
        <p>Create beautiful web applications with ease. No coding required.</p>
        <div className="hero-buttons">
          <button className="btn btn-primary btn-lg">Start Free Trial</button>
          <button className="btn btn-secondary btn-lg">Watch Demo</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Why choose us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Built for speed and performance from the ground up.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful Design</h3>
            <p>Stunning templates that look great on any device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Enterprise-grade security to protect your data.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to get started?</h2>
        <p>Join thousands of happy customers today.</p>
        <button className="btn btn-primary btn-lg">Sign Up Free</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
`,
      },
      {
        path: '/src/App.css',
        name: 'App.css',
        type: 'file',
        language: 'css',
        is_entry_point: false,
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.6;
  color: #1a1a2e;
}

.landing {
  min-height: 100vh;
}

/* Navigation */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5%;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #6366f1;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 8rem 5% 6rem;
  background: linear-gradient(180deg, #f8fafc 0%, white 100%);
}

.hero h1 {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
}

.hero p {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Features Section */
.features {
  padding: 6rem 5%;
  text-align: center;
}

.features h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #64748b;
}

/* CTA Section */
.cta {
  text-align: center;
  padding: 6rem 5%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta p {
  opacity: 0.9;
  margin-bottom: 2rem;
}

.cta .btn-primary {
  background: white;
  color: #6366f1;
}

/* Footer */
.footer {
  text-align: center;
  padding: 2rem;
  background: #1a1a2e;
  color: #94a3b8;
}
`,
      },
      {
        path: '/src/main.tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: false,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: '/index.html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        is_entry_point: false,
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <title>MyApp - Build Something Amazing</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
    ],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Admin dashboard with sidebar, stats cards, and charts',
    icon: '📊',
    color: '#10b981',
    files: [
      {
        path: '/src/App.tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: true,
        content: `import React, { useState } from 'react';
import './App.css';

const stats = [
  { label: 'Total Revenue', value: '$45,231', change: '+12.5%', positive: true },
  { label: 'Active Users', value: '2,345', change: '+8.2%', positive: true },
  { label: 'Conversion Rate', value: '3.24%', change: '-2.1%', positive: false },
  { label: 'Avg. Order Value', value: '$124', change: '+5.4%', positive: true },
];

const recentOrders = [
  { id: '#3210', customer: 'John Doe', status: 'Completed', amount: '$250.00' },
  { id: '#3209', customer: 'Jane Smith', status: 'Pending', amount: '$120.00' },
  { id: '#3208', customer: 'Bob Wilson', status: 'Processing', amount: '$450.00' },
  { id: '#3207', customer: 'Alice Brown', status: 'Completed', amount: '$80.00' },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={\`sidebar \${sidebarOpen ? 'open' : 'closed'}\`}>
        <div className="sidebar-header">
          <span className="logo">📊 Dashboard</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="icon">🏠</span>
            <span className="label">Overview</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">📈</span>
            <span className="label">Analytics</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">👥</span>
            <span className="label">Customers</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">📦</span>
            <span className="label">Products</span>
          </a>
          <a href="#" className="nav-item">
            <span className="icon">⚙️</span>
            <span className="label">Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Overview</h1>
          <div className="header-actions">
            <button className="btn btn-primary">+ New Report</button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={\`stat-change \${stat.positive ? 'positive' : 'negative'}\`}>
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Chart Placeholder */}
          <div className="card chart-card">
            <h2>Revenue Overview</h2>
            <div className="chart-placeholder">
              <div className="bar" style={{ height: '60%' }}></div>
              <div className="bar" style={{ height: '80%' }}></div>
              <div className="bar" style={{ height: '45%' }}></div>
              <div className="bar" style={{ height: '90%' }}></div>
              <div className="bar" style={{ height: '70%' }}></div>
              <div className="bar" style={{ height: '85%' }}></div>
              <div className="bar" style={{ height: '75%' }}></div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <h2>Recent Orders</h2>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>
                      <span className={\`status \${order.status.toLowerCase()}\`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
`,
      },
      {
        path: '/src/App.css',
        name: 'App.css',
        type: 'file',
        language: 'css',
        is_entry_point: false,
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #f1f5f9;
  color: #1e293b;
}

.dashboard {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #1e293b;
  color: white;
  transition: width 0.3s;
  position: fixed;
  height: 100vh;
  overflow: hidden;
}

.sidebar.closed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
}

.sidebar.closed .label,
.sidebar.closed .logo {
  display: none;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-item .icon {
  font-size: 1.25rem;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  transition: margin-left 0.3s;
}

.sidebar.closed + .main-content {
  margin-left: 70px;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.menu-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
}

.header h1 {
  flex: 1;
  font-size: 1.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

/* Chart Placeholder */
.chart-placeholder {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
  padding: 1rem 0;
}

.bar {
  flex: 1;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

/* Orders Table */
.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.orders-table th {
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.completed {
  background: #d1fae5;
  color: #059669;
}

.status.pending {
  background: #fef3c7;
  color: #d97706;
}

.status.processing {
  background: #dbeafe;
  color: #2563eb;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
`,
      },
      {
        path: '/src/main.tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: false,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: '/index.html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        is_entry_point: false,
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Product listing with cart, filters, and checkout',
    icon: '🛒',
    color: '#f59e0b',
    files: [
      {
        path: '/src/App.tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: true,
        content: `import React, { useState } from 'react';
import './App.css';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  { id: 1, name: 'Wireless Headphones', price: 99.99, image: '🎧', category: 'Electronics' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: '⌚', category: 'Electronics' },
  { id: 3, name: 'Running Shoes', price: 79.99, image: '👟', category: 'Sports' },
  { id: 4, name: 'Backpack', price: 49.99, image: '🎒', category: 'Accessories' },
  { id: 5, name: 'Sunglasses', price: 129.99, image: '🕶️', category: 'Accessories' },
  { id: 6, name: 'Camera', price: 599.99, image: '📷', category: 'Electronics' },
  { id: 7, name: 'Yoga Mat', price: 29.99, image: '🧘', category: 'Sports' },
  { id: 8, name: 'Water Bottle', price: 24.99, image: '🍶', category: 'Sports' },
];

const categories = ['All', 'Electronics', 'Sports', 'Accessories'];

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="store">
      {/* Header */}
      <header className="header">
        <h1>🛍️ ShopNow</h1>
        <button className="cart-btn" onClick={() => setCartOpen(!cartOpen)}>
          🛒 Cart ({cartCount})
        </button>
      </header>

      {/* Category Filter */}
      <div className="filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={\`filter-btn \${selectedCategory === cat ? 'active' : ''}\`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">{product.image}</div>
            <h3>{product.name}</h3>
            <p className="category">{product.category}</p>
            <p className="price">\${product.price.toFixed(2)}</p>
            <button className="add-btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      <div className={\`cart-sidebar \${cartOpen ? 'open' : ''}\`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        
        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <span className="item-image">{item.image}</span>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>\${item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span>\${cartTotal.toFixed(2)}</span>
              </div>
              <button className="checkout-btn">Checkout</button>
            </div>
          </>
        )}
      </div>

      {/* Overlay */}
      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)} />}
    </div>
  );
}

export default App;
`,
      },
      {
        path: '/src/App.css',
        name: 'App.css',
        type: 'file',
        language: 'css',
        is_entry_point: false,
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #fafafa;
  color: #1a1a2e;
}

.store {
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5%;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header h1 {
  font-size: 1.75rem;
}

.cart-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cart-btn:hover {
  background: #d97706;
}

/* Filters */
.filters {
  display: flex;
  gap: 1rem;
  padding: 2rem 5%;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #f59e0b;
}

.filter-btn.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 5% 4rem;
}

.product-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.product-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.product-card .category {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.product-card .price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.add-btn {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a2e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #2d2d4a;
}

/* Cart Sidebar */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 20px rgba(0,0,0,0.1);
  z-index: 100;
  transition: right 0.3s;
  display: flex;
  flex-direction: column;
}

.cart-sidebar.open {
  right: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.empty-cart {
  padding: 3rem;
  text-align: center;
  color: #64748b;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.item-image {
  font-size: 2rem;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.item-details p {
  color: #f59e0b;
  font-weight: 600;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-quantity button {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.remove-btn:hover {
  opacity: 1;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #d97706;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 75;
}

@media (max-width: 480px) {
  .cart-sidebar {
    width: 100%;
    right: -100%;
  }
}
`,
      },
      {
        path: '/src/main.tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: false,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: '/index.html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        is_entry_point: false,
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>ShopNow - E-commerce Store</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
    ],
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Clean blog layout with articles, sidebar, and author info',
    icon: '📝',
    color: '#ec4899',
    files: [
      {
        path: '/src/App.tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: true,
        content: `import React from 'react';
import './App.css';

const posts = [
  {
    id: 1,
    title: 'Getting Started with React in 2024',
    excerpt: 'Learn the fundamentals of React and build your first component-based application.',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    category: 'React',
    image: '⚛️',
  },
  {
    id: 2,
    title: 'The Future of Web Development',
    excerpt: 'Exploring emerging trends and technologies shaping the web development landscape.',
    date: 'Dec 12, 2024',
    readTime: '8 min read',
    category: 'Web Dev',
    image: '🌐',
  },
  {
    id: 3,
    title: 'Mastering TypeScript',
    excerpt: 'Take your JavaScript skills to the next level with TypeScript type safety.',
    date: 'Dec 10, 2024',
    readTime: '6 min read',
    category: 'TypeScript',
    image: '📘',
  },
];

const categories = ['All', 'React', 'Web Dev', 'TypeScript', 'CSS', 'JavaScript'];

function App() {
  return (
    <div className="blog">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <h1 className="logo">📝 DevBlog</h1>
          <div className="nav-links">
            <a href="#">Home</a>
            <a href="#">Articles</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <h2>Welcome to DevBlog</h2>
        <p>Insights, tutorials, and stories from the world of web development</p>
      </section>

      {/* Main Content */}
      <div className="content-wrapper">
        <main className="main">
          <h3 className="section-title">Latest Articles</h3>
          <div className="posts">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-image">{post.image}</div>
                <div className="post-content">
                  <span className="post-category">{post.category}</span>
                  <h4>{post.title}</h4>
                  <p>{post.excerpt}</p>
                  <div className="post-meta">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Author Card */}
          <div className="author-card">
            <div className="author-avatar">👨‍💻</div>
            <h4>John Developer</h4>
            <p>Full-stack developer sharing knowledge about modern web technologies.</p>
            <div className="social-links">
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>

          {/* Categories */}
          <div className="categories-card">
            <h4>Categories</h4>
            <div className="categories-list">
              {categories.map(cat => (
                <a key={cat} href="#" className="category-tag">{cat}</a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="newsletter-card">
            <h4>Newsletter</h4>
            <p>Get the latest articles delivered to your inbox.</p>
            <input type="email" placeholder="your@email.com" />
            <button>Subscribe</button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 DevBlog. Built with ❤️ and React.</p>
      </footer>
    </div>
  );
}

export default App;
`,
      },
      {
        path: '/src/App.css',
        name: 'App.css',
        type: 'file',
        language: 'css',
        is_entry_point: false,
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Georgia', serif;
  background: #fafafa;
  color: #1a1a2e;
  line-height: 1.8;
}

.blog {
  min-height: 100vh;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-family: system-ui, sans-serif;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #ec4899;
}

/* Hero */
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 100%);
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero p {
  color: #64748b;
  font-size: 1.125rem;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
}

/* Main Content */
.section-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-family: system-ui, sans-serif;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  transition: transform 0.2s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateX(5px);
}

.post-image {
  width: 150px;
  min-height: 150px;
  background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.post-content {
  padding: 1.5rem;
  flex: 1;
}

.post-category {
  display: inline-block;
  background: #fdf2f8;
  color: #ec4899;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.post-content h4 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-family: system-ui, sans-serif;
}

.post-content p {
  color: #64748b;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.8125rem;
  font-family: system-ui, sans-serif;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.author-card,
.categories-card,
.newsletter-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.author-avatar {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
}

.author-card h4 {
  text-align: center;
  font-family: system-ui, sans-serif;
  margin-bottom: 0.5rem;
}

.author-card p {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-links a {
  color: #ec4899;
  text-decoration: none;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
}

.categories-card h4,
.newsletter-card h4 {
  font-family: system-ui, sans-serif;
  margin-bottom: 1rem;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  text-decoration: none;
  font-family: system-ui, sans-serif;
  font-size: 0.8125rem;
  transition: all 0.2s;
}

.category-tag:hover {
  background: #ec4899;
  color: white;
}

.newsletter-card p {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.newsletter-card input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-family: system-ui, sans-serif;
}

.newsletter-card button {
  width: 100%;
  padding: 0.75rem;
  background: #ec4899;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.newsletter-card button:hover {
  background: #db2777;
}

/* Footer */
.footer {
  text-align: center;
  padding: 2rem;
  background: #1a1a2e;
  color: #94a3b8;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
}

@media (max-width: 900px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .post-card {
    flex-direction: column;
  }

  .post-image {
    width: 100%;
    height: 120px;
  }
}
`,
      },
      {
        path: '/src/main.tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
        is_entry_point: false,
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: '/index.html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        is_entry_point: false,
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevBlog - Web Development Insights</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
    ],
  },
];
