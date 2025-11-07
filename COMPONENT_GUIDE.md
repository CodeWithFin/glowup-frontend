# 🎨 Component Usage Guide

Quick reference for using the GlowUp components in your application.

## 🎯 Quick Component Imports

```tsx
// Layout
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Auth
import { AuthModal } from '@/components/auth/auth-modal';

// UI
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';

// Hooks
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/store/ui-store';
```

---

## 📱 Header Component

### Basic Usage
```tsx
import { Header } from '@/components/layout/header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
```

### Features Available
- ✅ Logo (links to home)
- ✅ Mega menu dropdowns (hover on desktop)
- ✅ Mobile hamburger menu
- ✅ Search icon (placeholder)
- ✅ Theme toggle
- ✅ User icon (triggers auth modal)
- ✅ Cart icon with badge

---

## 👤 Auth Modal

### Trigger from Store
```tsx
import { useUIStore } from '@/store/ui-store';

function MyComponent() {
  const openAuthModal = useUIStore(state => state.openAuthModal);
  
  return (
    <button onClick={() => openAuthModal('signin')}>
      Sign In
    </button>
  );
}
```

### Available Modes
```tsx
// Open sign in form
openAuthModal('signin');

// Open sign up form
openAuthModal('signup');

// Close modal
closeAuthModal();
```

---

## 🎨 Theme Toggle

### Direct Usage
```tsx
import { ThemeToggle } from '@/components/theme-toggle';

function Navbar() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

### Access Current Theme
```tsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  console.log(theme); // 'light', 'dark', or 'system'
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark
    </button>
  );
}
```

---

## 🔔 Toast Notifications

### Basic Toast
```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const showToast = () => {
    toast({
      title: "Success!",
      description: "Your changes have been saved.",
    });
  };
  
  return <button onClick={showToast}>Save</button>;
}
```

### Toast Variants
```tsx
// Success
toast({
  title: "Success",
  description: "Action completed successfully.",
});

// Error
toast({
  title: "Error",
  description: "Something went wrong.",
  variant: "destructive",
});

// With Action
toast({
  title: "New message",
  description: "You have a new message.",
  action: <button>View</button>,
});
```

---

## 🎯 Button Component

### Variants
```tsx
import { Button } from '@/components/ui/button';

// Default (primary rose gold)
<Button>Click Me</Button>

// Outline
<Button variant="outline">Outline</Button>

// Ghost (transparent)
<Button variant="ghost">Ghost</Button>

// Secondary
<Button variant="secondary">Secondary</Button>

// Destructive (red)
<Button variant="destructive">Delete</Button>

// Link
<Button variant="link">Link</Button>
```

### Sizes
```tsx
// Small
<Button size="sm">Small</Button>

// Default
<Button>Default</Button>

// Large
<Button size="lg">Large</Button>

// Icon
<Button size="icon">
  <Icon />
</Button>
```

### With Icons
```tsx
import { ArrowRight, Plus } from 'lucide-react';

<Button>
  Shop Now
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add to Cart
</Button>
```

---

## 💬 Dialog (Modal)

### Basic Modal
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Modal</DialogTitle>
          </DialogHeader>
          <p>Modal content here</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🎭 Framer Motion Animations

### Fade In
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Hover Scale
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### Stagger Children
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

---

## 🗄️ Zustand Store

### Access Store
```tsx
import { useUIStore } from '@/store/ui-store';

function MyComponent() {
  // Get specific values
  const isAuthModalOpen = useUIStore(state => state.isAuthModalOpen);
  
  // Get actions
  const { openAuthModal, closeMobileMenu } = useUIStore();
  
  return (
    <button onClick={() => openAuthModal('signin')}>
      Sign In
    </button>
  );
}
```

### Available State
```tsx
{
  // Auth Modal
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  
  // Mobile Menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  // Mega Menu
  activeMegaMenu: string | null;
  setActiveMegaMenu: (menu: string | null) => void;
}
```

---

## 🔍 React Query

### Basic Query
```tsx
import { useQuery } from '@tanstack/react-query';

function Products() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* render data */}</div>;
}
```

### With Parameters
```tsx
const { data } = useQuery({
  queryKey: ['product', productId],
  queryFn: async () => {
    const res = await fetch(`/api/products/${productId}`);
    return res.json();
  },
});
```

---

## 🎨 Styling Patterns

### Container
```tsx
<div className="container px-4 md:px-6 py-12">
  {/* Content */}
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Card
```tsx
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card description</p>
</div>
```

### Gradient Text
```tsx
<h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Hover Effect
```tsx
<div className="transition-all hover:shadow-lg hover:scale-105">
  {/* Content */}
</div>
```

---

## 🎯 Layout Patterns

### Page Layout
```tsx
export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Page content */}
      </main>
      <Footer />
    </div>
  );
}
```

### Section Layout
```tsx
<section className="py-16 md:py-24">
  <div className="container px-4 md:px-6">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Section Title</h2>
      <p className="text-muted-foreground">Section description</p>
    </div>
    {/* Section content */}
  </div>
</section>
```

### Two Column Layout
```tsx
<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

---

## 📦 Common Imports

### Icons
```tsx
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Heart,
  Star,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';
```

### Next.js
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
```

### React
```tsx
import { useState, useEffect, useCallback } from 'react';
```

---

## 🎨 Color Classes

### Background
```tsx
className="bg-primary"        // Rose gold
className="bg-secondary"      // Soft blush
className="bg-accent"         // Champagne
className="bg-muted"          // Neutral
className="bg-background"     // Page background
className="bg-card"           // Card background
```

### Text
```tsx
className="text-primary"              // Rose gold
className="text-muted-foreground"     // Muted text
className="text-foreground"           // Main text
className="text-card-foreground"      // Card text
```

### Borders
```tsx
className="border"                    // Default border
className="border-primary"            // Rose gold border
className="border-muted"              // Subtle border
```

---

## 🚀 Quick Tips

1. **Always use 'use client'** for components with hooks or interactivity
2. **Use @ alias** for imports: `@/components/...`
3. **Add animations** with Framer Motion for premium feel
4. **Test both themes** when styling components
5. **Use shadcn components** before creating custom ones
6. **Keep mobile-first** approach in mind
7. **Leverage Tailwind** instead of custom CSS

---

## 📚 More Resources

- Components: See `components/` directory
- Docs: `README.md`, `PROJECT_STRUCTURE.md`, `DEV_GUIDE.md`
- Examples: Check `app/page.tsx` for usage patterns

Happy building! 🎉
