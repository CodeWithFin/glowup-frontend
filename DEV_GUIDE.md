# Development Guide - GlowUp Frontend

## 🎯 Quick Start

```bash
# Navigate to project
cd glowup-frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🧪 Testing Components

### Test the Header
1. Open http://localhost:3000
2. Hover over "Skincare", "Makeup", or "Wellness" to see mega menus
3. Click the hamburger menu icon on mobile view
4. Test search icon, cart icon, and user icon

### Test the Auth Modal
1. Click the User icon in header (desktop)
2. Or click "Sign In" button in mobile menu
3. Toggle between Sign In and Sign Up
4. Test form animations

### Test Theme Toggle
1. Click the sun/moon icon in header
2. Select Light, Dark, or System theme
3. Verify smooth transitions
4. Check that theme persists on page reload

### Test Toast Notifications
```typescript
// Use in any component:
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success!",
  description: "Your action was completed.",
});
```

## 📝 Adding New Components

### Add a shadcn/ui Component
```bash
# List available components
npx shadcn@latest add

# Add specific component
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
```

### Create Custom Component
```typescript
// components/my-component.tsx
'use client'; // Add if component uses hooks or interactivity

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <Button>Click Me</Button>
    </motion.div>
  );
}
```

## 🎨 Styling Guidelines

### Use Tailwind Classes
```tsx
// Good
<div className="flex items-center gap-4 p-6 rounded-lg bg-primary text-primary-foreground">

// Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### Use Design System Colors
```tsx
// Primary colors (rose gold)
className="bg-primary text-primary-foreground"

// Secondary colors (soft blush)
className="bg-secondary text-secondary-foreground"

// Accent colors (champagne)
className="bg-accent text-accent-foreground"

// Muted (neutral)
className="bg-muted text-muted-foreground"
```

### Custom Fonts
```tsx
// For headings (Playfair Display)
<h1 className="font-playfair text-4xl font-bold">

// For body (Inter - default)
<p className="text-base">
```

## 🔄 State Management

### Using Zustand Store
```typescript
import { useUIStore } from '@/store/ui-store';

function MyComponent() {
  const { openAuthModal, isAuthModalOpen } = useUIStore();
  
  return (
    <button onClick={() => openAuthModal('signin')}>
      Sign In
    </button>
  );
}
```

### Using React Query
```typescript
import { useQuery } from '@tanstack/react-query';

function Products() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* render products */}</div>;
}
```

## 🎭 Animation Patterns

### Page Entrance
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* content */}
</motion.div>
```

### Hover Effect
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
    visible: { transition: { staggerChildren: 0.1 } },
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

## 📁 File Organization

### Component Files
```
components/
  ├── ui/              # shadcn/ui components (don't edit)
  ├── layout/          # Layout components (header, footer, sidebar)
  ├── auth/            # Authentication related
  ├── products/        # Product related components
  ├── cart/            # Shopping cart components
  └── common/          # Reusable common components
```

### Page Files (App Router)
```
app/
  ├── (marketing)/     # Marketing pages (group route)
  │   ├── about/
  │   └── contact/
  ├── (shop)/          # Shopping pages (group route)
  │   ├── products/
  │   └── cart/
  └── (account)/       # User account pages
      ├── profile/
      └── orders/
```

## 🐛 Common Issues & Solutions

### Issue: Hydration Errors
**Solution:** Make sure client components use 'use client' directive
```tsx
'use client';

export function MyComponent() {
  // Component that uses useState, useEffect, etc.
}
```

### Issue: Theme Not Working
**Solution:** Ensure ThemeProvider wraps your app in layout.tsx
```tsx
<html suppressHydrationWarning>
  <ThemeProvider>{children}</ThemeProvider>
</html>
```

### Issue: Tailwind Classes Not Working
**Solution:** Check tailwind.config.ts includes your file path
```ts
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],
```

### Issue: Import Path Errors
**Solution:** Use the @ alias configured in tsconfig.json
```tsx
// Good
import { Button } from '@/components/ui/button';

// Avoid
import { Button } from '../../components/ui/button';
```

## 🔍 Debugging Tips

### Check Component Render
```tsx
useEffect(() => {
  console.log('Component mounted', props);
}, []);
```

### Debug Zustand Store
```tsx
// Store already has devtools enabled
// Open Redux DevTools in browser to inspect state
```

### Check React Query Cache
```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
console.log(queryClient.getQueryData(['products']));
```

## 📦 Useful Packages to Consider

```bash
# Form handling
npm install react-hook-form zod @hookform/resolvers

# Date handling
npm install date-fns

# Icons (already have lucide-react)
# More icons at https://lucide.dev

# Image carousel
npm install embla-carousel-react

# Animations
# Already have framer-motion ✓

# API client
npm install axios
```

## 🎨 Design Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **shadcn/ui Components**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion
- **Lucide Icons**: https://lucide.dev
- **Color Palette Tool**: https://uicolors.app

## 🚀 Build & Deploy

### Local Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 📚 Learning Resources

- **Next.js 14 Docs**: https://nextjs.org/docs
- **React Query Guide**: https://tanstack.com/query/latest
- **Zustand Tutorial**: https://github.com/pmndrs/zustand
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

Happy coding! 🎉 If you have questions, check the README.md or PROJECT_STRUCTURE.md
