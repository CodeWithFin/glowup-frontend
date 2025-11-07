# GlowUp Frontend - Project Structure & Documentation

## 📋 Complete File Structure

```
glowup-frontend/
│
├── app/
│   ├── layout.tsx                    # Root layout with providers, SEO, fonts
│   ├── page.tsx                      # Home page with hero, features, CTA
│   ├── globals.css                   # Global styles, design system, animations
│   └── _providers.tsx                # React Query, Theme, Toast providers
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx                # Button component (variants: default, outline, etc.)
│   │   ├── dialog.tsx                # Modal/Dialog component
│   │   ├── dropdown-menu.tsx         # Dropdown menu component
│   │   ├── switch.tsx                # Toggle switch component
│   │   ├── toast.tsx                 # Toast notification component
│   │   └── toaster.tsx               # Toast container/manager
│   │
│   ├── layout/
│   │   ├── header.tsx                # Header with mega menu navigation
│   │   └── footer.tsx                # Footer with newsletter, links, social
│   │
│   ├── auth/
│   │   └── auth-modal.tsx            # Authentication modal (sign in/up)
│   │
│   └── theme-toggle.tsx              # Dark/Light theme switcher
│
├── store/
│   └── ui-store.ts                   # Zustand store for UI state management
│
├── lib/
│   ├── utils.ts                      # Utility functions (cn, etc.)
│   └── config/
│       └── seo.ts                    # SEO metadata configuration
│
├── hooks/
│   └── use-toast.ts                  # Toast notification hook
│
├── public/                           # Static assets (images, icons, fonts)
│
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore rules
├── components.json                   # shadcn/ui configuration
├── next.config.mjs                   # Next.js configuration
├── package.json                      # Dependencies and scripts
├── postcss.config.mjs                # PostCSS configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # Project documentation
```

## 🎨 Design System

### Color Scheme (Premium Beauty Brand)

**Light Mode:**
- Background: Pure white (hsl(0 0% 100%))
- Primary: Rose Gold (hsl(346 77% 58%)) - #E75B8D
- Secondary: Soft Blush (hsl(340 82% 96%))
- Accent: Champagne Gold (hsl(45 100% 90%))
- Muted: Warm Neutral (hsl(30 15% 96%))

**Dark Mode:**
- Background: Deep charcoal (hsl(0 0% 7%))
- Primary: Lighter rose gold (hsl(346 70% 65%))
- Borders and accents adjusted for dark backgrounds

### Typography

1. **Inter (Primary Font)**
   - Usage: Body text, UI elements, navigation
   - Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
   - Variable: `--font-inter`

2. **Playfair Display (Display Font)**
   - Usage: Headings, hero text, luxury feel
   - Weights: 400-900
   - Variable: `--font-playfair`

### Spacing & Layout

- Container: Max-width responsive container with padding
- Border Radius: 0.75rem default (adjustable via CSS variables)
- Breakpoints: 
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🧩 Component Overview

### Header (`components/layout/header.tsx`)
**Features:**
- Sticky navigation bar
- Logo with hover animation
- Mega menu for categories (Skincare, Makeup, Wellness)
- Desktop & mobile navigation
- Search icon
- Theme toggle
- User account icon
- Shopping cart with badge
- Mobile hamburger menu

**Mega Menu Structure:**
- Skincare: By Concern, By Product, Collections
- Makeup: Face, Eyes, Lips
- Wellness: Self-Care, Hair Care

### Footer (`components/layout/footer.tsx`)
**Sections:**
1. Newsletter signup form
2. Navigation links grid (Shop, Help, About)
3. Social media links (Instagram, Twitter, Facebook)
4. Legal links (Privacy Policy, Terms, Accessibility)
5. Copyright notice

### Auth Modal (`components/auth/auth-modal.tsx`)
**Features:**
- Toggle between Sign In and Sign Up
- Email/password inputs
- Social login options (Google, Apple)
- Remember me checkbox
- Forgot password link
- Terms acceptance checkbox (signup)
- Smooth animations with Framer Motion

### Theme Toggle (`components/theme-toggle.tsx`)
**Options:**
- Light mode
- Dark mode
- System preference
- Animated icon transitions
- Dropdown menu interface

## 📦 State Management

### Zustand Store (`store/ui-store.ts`)
**State:**
- `isAuthModalOpen`: Boolean for auth modal visibility
- `authModalMode`: 'signin' | 'signup'
- `isMobileMenuOpen`: Mobile menu state
- `activeMegaMenu`: Currently active mega menu

**Actions:**
- `openAuthModal(mode)`: Open auth modal with specified mode
- `closeAuthModal()`: Close auth modal
- `toggleMobileMenu()`: Toggle mobile navigation
- `closeMobileMenu()`: Close mobile navigation
- `setActiveMegaMenu(menu)`: Set active mega menu category

## 🔌 Providers (`app/_providers.tsx`)

1. **QueryClientProvider**: React Query setup
   - Stale time: 60 seconds
   - Refetch on window focus: disabled

2. **ThemeProvider**: next-themes integration
   - Attribute: class
   - Default: light
   - System detection: enabled
   - Transition: disabled for instant switching

3. **Toaster**: Toast notification container

## 🎯 Key Features Implemented

### ✅ Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Hamburger menu for mobile

### ✅ Animations
- Framer Motion for smooth transitions
- Hover effects on interactive elements
- Page load animations
- Theme switch animations
- Modal enter/exit animations

### ✅ Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus states

### ✅ Performance
- Next.js App Router for optimal loading
- React Query for efficient data fetching
- Lazy loading ready
- Image optimization support (Next Image)

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📱 Pages

### Home Page (`app/page.tsx`)
**Sections:**
1. **Hero Section**
   - Main headline with gradient text
   - Subheadline
   - CTA buttons (Shop Now, Explore Collections)
   - Hero visual placeholder
   - Decorative gradient blobs

2. **Features Section**
   - Clean Beauty
   - Self-Care First
   - Premium Quality
   - Icon + Title + Description cards
   - Hover effects

3. **CTA Section**
   - Full-width background with primary color
   - Call to action headline
   - Secondary CTAs (Create Account, Take Quiz)

## 🔐 Environment Variables (Future)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=
DATABASE_URL=
AUTH_SECRET=
```

## 🚀 Deployment Checklist

- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Set up analytics
- [ ] Add robots.txt and sitemap.xml
- [ ] Configure CDN for images
- [ ] Set up error monitoring
- [ ] Enable compression
- [ ] Configure security headers

## 📈 Performance Targets

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 🎨 Brand Assets Needed

- Logo (SVG preferred)
- Favicon set (16x16, 32x32, 192x192, 512x512)
- OG image (1200x630)
- Product images
- Category images
- Hero images/videos

## 📝 Notes

- CSS errors in globals.css are expected (Tailwind directives)
- All components are fully typed with TypeScript
- Design inspired by Fenty Beauty, Sephora, and Glossier
- Emphasis on clean, modern, premium aesthetic
- Mobile-first, responsive design throughout

---

**Status**: Phase 1 Complete ✅
**Next Phase**: Product catalog and shopping functionality
