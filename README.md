# GlowUp Kenya - Premium Beauty E-Commerce Platform# GlowUp Kenya - Premium Beauty E-Commerce Platform# GlowUp Kenya - Premium Beauty E-Commerce Platform# GlowUp - Premium Beauty E-Commerce PlatformThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, full-featured beauty e-commerce platform built with Next.js 14, featuring cart management, checkout with Stripe payments, order lifecycle, returns processing, and a loyalty rewards program.



## 🚀 Features CompletedA modern, full-featured beauty e-commerce platform built with Next.js 14, featuring cart management, checkout with Stripe, order lifecycle, and returns processing.



### ✅ Phase 1-4: Foundation, Authentication & Product Catalog



- **Next.js 14** App Router with TypeScript## 🚀 Completed FeaturesA modern, full-featured beauty e-commerce platform built with Next.js 14, inspired by Fenty Beauty, Glossier, and Sephora.

- **Tailwind CSS** with custom rose gold/champagne design system

- **shadcn/ui** components with Framer Motion animations

- **Authentication** with HTTP-only cookies

- **Product Catalog** with:### Phase 1-4: Foundation, Auth, Homepage & Product Catalog

  - Advanced filtering (skin type, concerns, brands, price)

  - Search with debouncing- Next.js 14 App Router with TypeScript

  - Sort options (newest, price, rating, popular)

  - Infinite scroll with React Query- Tailwind CSS with custom rose gold design system## 🚀 Features CompletedA modern, elegant beauty e-commerce platform built with Next.js 14, inspired by premium brands like Fenty Beauty, Sephora, and Glossier.## Getting Started

- **Homepage** with dark hero, product sections, reviews carousel

- Protected routes via middleware- shadcn/ui components with Framer Motion animations



### ✅ Phase 5: Cart & Redis Caching- Authentication system with HTTP-only cookies



- **Redis-backed cart service** (Upstash or in-memory fallback)- Product catalog with advanced filtering, search, infinite scroll

- **Anonymous session cart** with `glowup_session` cookie

- **Cart-to-user merge** on login- React Query for data fetching with devtools### ✅ Phase 1: Foundation & Layout

- **API Endpoints**:

  - `GET /api/cart` - Fetch cart

  - `POST /api/cart/items` - Add item

  - `PUT /api/cart/items/[id]` - Update quantity### ✅ Phase 5: Cart & Redis Caching- **Next.js 14** with App Router and TypeScript

  - `DELETE /api/cart/items/[id]` - Remove item

- **TTL-based expiration** (7 days)- Redis-backed cart service (Upstash or in-memory fallback)

- Smart quantity merging (same product+variant)

- Anonymous session cart with `glowup_session` cookie- **Tailwind CSS** with custom rose gold/champagne design system## 🚀 Tech StackFirst, run the development server:

### ✅ Phase 6: Checkout & Stripe Payments

- Cart-to-user merge on login

- **Order draft creation** with tax (16% VAT) and shipping calculation

- **Stripe payment intent** creation with idempotency- API: `GET /api/cart`, `POST /api/cart/items`, `PUT|DELETE /api/cart/items/[id]`- **shadcn/ui** component library (20+ components)

- **Webhook handler** (`POST /api/webhooks/stripe`) for payment success

- **Order finalization**:- TTL-based cart expiration (7 days)

  - Saves order to Redis

  - Clears cart- **Framer Motion** animations

  - Triggers post-order jobs (inventory, loyalty, email)

- **Idempotency** via event tracking### ✅ Phase 6: Checkout & Payments



### ✅ Phase 7: Order Lifecycle & Returns- Order draft creation with tax (16%) and shipping calculation- **TanStack React Query** for data fetching



- **Order Status Flow**: - Stripe payment intent creation with idempotency

  - `paid` → `processing` → `shipped` → `delivered`

  - `return_requested` → `return_approved`/`return_denied` → `refunded`- Webhook handler (`POST /api/webhooks/stripe`) for payment success- **Zustand** for UI state management- **Framework**: Next.js 14 (App Router)```bash

- **Order APIs**:

  - `GET /api/orders` - List user's orders- Order finalization: saves order, clears cart, triggers post-order jobs

  - `GET /api/orders/[id]` - Fetch order details (user or admin)

  - `PUT /api/orders/[id]` - Update status/tracking (admin only)- Stubs for inventory decrement, loyalty points, email confirmation- **next-themes** for dark/light mode

- **Returns APIs**:

  - `POST /api/returns` - Create return request (with photos, reasons)

  - `GET /api/returns/[id]` - Fetch return details

  - `PUT /api/returns/[id]` - Approve/deny return (admin only)### ✅ Phase 7: Orders, Returns & Admin- Responsive header with mega menu navigation- **Language**: TypeScriptnpm run dev

  - `POST /api/webhooks/refund` - Mark return refunded (idempotent)

- **Admin Authorization** via `ADMIN_USER_IDS` environment variable- **Order Lifecycle**: paid → processing → shipped → delivered → (refunded/cancelled)

- **Order Indexing** by userId and status for efficient search

- **Event Audit Logs** on orders and returns- **Order APIs**:- Footer with newsletter subscription



### ✅ Phase 8: Loyalty & Rewards Program  - `GET /api/orders` - List user's orders



- **Loyalty Account Management**:  - `GET /api/orders/[id]` - Fetch order details (user owns or admin)- Theme toggle with system preference support- **Styling**: Tailwind CSS# or

  - Automatic account creation on first points accrual

  - Balance tracking with Redis persistence  - `PUT /api/orders/[id]/status` - Update order status (admin only)

  - Tier system: Bronze → Silver → Gold → Platinum

  - Transaction history (up to 100 recent transactions)- **Returns Flow**:- Toast notifications

  

- **Accrual Rules** (configurable via env):  - `POST /api/returns` - Create return request with photos and reasons

  - **Purchase Points**: Earn points per KES spent (default: 1 point per 100 KES)

  - **Review Bonus**: 50 points for product reviews (ready for integration)  - `GET /api/returns/[id]` - Fetch return details- **UI Components**: shadcn/uiyarn dev

  - **Referral Bonuses**: 500 points for referrer, 250 for referee (ready for integration)

  - **Points Expiry**: Optional expiration after 365 days  - `PUT /api/returns/[id]/decision` - Approve/deny return (admin only)



- **Points Redemption**:  - `POST /api/webhooks/refund` - Mark return as refunded (idempotent)### ✅ Phase 2: Authentication System

  - Redeem points for discount during checkout

  - Minimum redemption: 100 points- **Admin Authorization**: `ADMIN_USER_IDS` env variable

  - Conversion rate: 1 point = 1 KES discount (configurable)

  - Validation checks (sufficient balance, minimum threshold)- Order indexing by userId and status for search- Complete auth flow with **react-hook-form** + **zod** validation- **Animations**: Framer Motion# or



- **API Endpoints**:- Event audit logs on orders and returns

  - `GET /api/loyalty/balance` - Get account balance and tier

  - `POST /api/loyalty/redeem` - Redeem points for discount- HTTP-only cookie authentication (secure token handling)



- **Checkout Integration**:## 🛠️ Tech Stack

  - `pointsToRedeem` parameter in checkout intent

  - Automatic points debit before payment- API routes proxying to backend (`/api/auth/*`)- **State Management**: Zustandpnpm dev

  - Points discount reflected in order total

  - Points earned credited after successful payment- **Framework**: Next.js 14.2.33 (App Router)



- **Post-Order Integration**:- **Language**: TypeScript- Protected routes with middleware

  - Automatic points accrual after order completion

  - Points calculation based on final order amount- **Styling**: Tailwind CSS + shadcn/ui

  - Transaction history with order references

- **Animation**: Framer Motion- Auth context with global user state- **Data Fetching**: TanStack React Query# or

### ✅ Phase 9: Routine Tracking & Diary

- **Routine Management**:
  - Create named skincare/beauty routines with product lists
  - Custom schedules (daily, weekly, specific days, times of day)
  - Define skin goals (acne, dryness, anti-aging, etc.)
  - Product ordering within routines
  - Active/inactive routine toggling

- **Diary Entries**:
  - Daily routine logging with timestamps
  - Photo uploads with progress tracking
  - Notes and observations
  - Completion status tracking
  - Photo comparison (before/after)

- **Skin Metrics & Scoring**:
  - Track hydration, texture, redness, breakouts
  - Automated skin score calculation (0-100)
  - Trend analysis and insights
  - Personalized recommendations based on metrics

- **Media Upload Service**:
  - Image validation (JPEG, PNG, WebP, GIF)
  - Size limits (5MB) with compression suggestions
  - Secure upload signatures
  - Multiple photo support per entry

- **API Endpoints**:
  - `POST /api/routines` - Create new routine
  - `GET /api/routines` - List user routines
  - `GET /api/routines/[id]` - Get routine details
  - `PUT /api/routines/[id]` - Update routine
  - `DELETE /api/routines/[id]` - Delete routine
  - `POST /api/routines/[id]/entries` - Log diary entry
  - `GET /api/diary/entries/[id]` - Get entry details
  - `PUT /api/diary/entries/[id]` - Update entry
  - `POST /api/diary/compare` - Compare diary photos
  - `POST /api/media/upload` - Upload media files

### ✅ Phase 10: Content Hub (Blog & Video)

- **Blog Post Management**:
  - Rich content editor with HTML sanitization
  - Markdown support with auto-conversion
  - Draft and published status workflow
  - SEO metadata (title, description, keywords)
  - Featured images and excerpts
  - Automatic read time calculation
  - View count tracking
  - Slug-based URLs

- **Video Embed Support**:
  - YouTube integration (standard and shorts URLs)
  - Instagram Reels embedding
  - TikTok video support
  - Vimeo integration
  - Automatic thumbnail generation
  - Embed URL validation
  - Responsive dimensions (16:9, 9:16)

- **Content Organization**:
  - Categories with descriptions, colors, and icons
  - Tags system for cross-referencing
  - Post counts on categories/tags
  - Content filtering by category, tag, type
  - Full-text search across titles and content
  - Sorting options (date, views, title)

- **Security Features**:
  - XSS prevention via HTML sanitization
  - Script tag removal
  - Event handler stripping
  - Protocol validation (removes javascript:, data:)
  - Allowed tags whitelist (18 safe tags)
  - Attribute filtering

- **API Endpoints**:
  - **Admin** (requires authorization):
    - `POST /api/admin/content` - Create post
    - `GET /api/admin/content` - List all posts (including drafts)
    - `GET /api/admin/content/[id]` - Get post by ID
    - `PUT /api/admin/content/[id]` - Update post
    - `DELETE /api/admin/content/[id]` - Delete post
    - `POST /api/admin/categories` - Create category
    - `GET /api/admin/categories` - List categories
    - `POST /api/admin/tags` - Create tag
    - `GET /api/admin/tags` - List tags
  - **Public**:
    - `GET /api/content` - List published posts
    - `GET /api/content/[slug]` - Get post by slug (increments views)
    - `GET /api/content/categories` - List categories
    - `GET /api/content/tags` - List tags

### ✅ Phase 11: Consultations & Chat Integration

- **Virtual Consultation Booking**:
  - Book skincare, makeup, routine, or product recommendation consultations
  - 30-minute consultation slots (9 AM - 5 PM)
  - Minimum 2-hour advance booking, max 30 days ahead
  - Real-time availability checking
  - Automatic conflict detection and prevention
  - Reschedule and cancellation support

- **Multi-Channel Notifications**:
  - WhatsApp integration via Twilio
  - SMS fallback for failed WhatsApp delivery
  - Email as final fallback
  - Automatic notification routing with retries

- **Smart Reminder System**:
  - Booking confirmation (immediate)
  - 24-hour advance reminder
  - 1-hour advance reminder
  - Webhook-driven reminder processing
  - Template-based messaging

- **Calendar Integration**:
  - iCal (.ics) file generation
  - Meeting link generation (Zoom/Google Meet ready)
  - Calendar event creation with reminders
  - Cancellation invite handling
  - Localized date/time formatting (Kenya timezone)

- **Booking Management**:
  - View booking history by user or consultant
  - Filter by status (pending, confirmed, completed, cancelled)
  - Filter by consultation type
  - Date range queries
  - Payment status tracking (pending, paid, refunded)
  - Post-consultation notes

- **API Endpoints**:
  - `POST /api/consultations/book` - Create new booking with notifications
  - `GET /api/consultations/[id]` - Get booking details
  - `GET /api/consultations/availability` - Check available time slots
  - `POST /api/webhooks/consultation` - Process reminders (cron trigger)

- **Twilio Integration**:
  - WhatsApp Business API via Twilio
  - SMS delivery via Twilio
  - E.164 phone number formatting
  - Message template processing
  - Delivery status tracking
  - Mock mode for development

## 🛠️ Tech Stack

- **State**: Zustand (UI), TanStack React Query (server state)

### Core Framework

- **Next.js** 14.2.33 (App Router)- **Data Layer**: Redis (Upstash) for cart, orders, returns- User avatar dropdown when logged in

- **TypeScript** 5.x

- **React** 18.x- **Payments**: Stripe (payment intents + webhooks)



### Styling & UI- **Forms**: react-hook-form + zod- Redirect flow with callback URLs- **Theme**: next-themes (Dark/Light mode)bun dev

- **Tailwind CSS** 3.4.x

- **shadcn/ui** component library (20+ components)- **Testing**: Vitest (91 tests passing across 11 test files)

- **Framer Motion** for animations

- **next-themes** for dark/light mode

- **Lucide React** icons

- **Fonts**: Inter (body), Playfair Display (headings)## 📁 Key Structure



### State & Data### ✅ Phase 3: Brand Homepage```

- **TanStack React Query** v5 with devtools

- **Zustand** v5 for UI state```

- **react-hook-form** + **zod** for forms

- **Cloudinary** for image optimizationapp/- Dark hero section with skin-positivity messaging



### Backend & Storage├── api/

- **Redis** (Upstash) with in-memory fallback

- **Stripe** for payments and webhooks│   ├── auth/*              # Login, register, logout, me, forgot/reset- Product sections (best sellers, new arrivals)## 📁 Project Structure

- HTTP-only cookies for auth & sessions

│   ├── cart/               # GET cart, POST items, PUT/DELETE items/[id]

### Testing

- **Vitest** 2.1.9

- **72 tests** across 10 test files (cart, checkout, orders, returns, loyalty, routines, diary, media, content, webhooks)

### Development

- **ESLint** + **Prettier**│   ├── returns/            # POST create, GET/PUT [id]- **Embla Carousel** for reviews and social feedsOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Husky** for git hooks

- **embla-carousel-react** for carousels│   └── webhooks/



## 📁 Project Structure│       ├── stripe/         # POST payment webhook- Ingredients education section



```│       └── refund/         # POST refund webhook

app/

├── api/├── products/               # Product catalog page + detail pages- TikTok/Instagram social media embeds```

│   ├── auth/           # Login, register, logout, forgot password

│   ├── cart/           # Cart CRUD operations└── auth/                   # Login, register, forgot, reset pages

│   ├── checkout/       # Payment intent creation

│   ├── orders/         # Order management- Skeleton loading states

│   ├── returns/        # Returns workflow

│   ├── loyalty/        # Loyalty balance & redemption

│   ├── routines/       # Routine CRUD operations

│   ├── diary/          # Diary entries & comparisons

│   ├── media/          # File upload handling

│   ├── content/        # Public blog content (GET)

│   ├── admin/          # Admin content management (POST/PUT/DELETE)

│   ├── consultations/  # Booking, availability endpoints

│   └── webhooks/       # Stripe, refund, consultation webhooks

├── auth/               # Auth pages (login, register, reset)├── cart/                   # Cart service + session utils- Responsive grid layoutsglowup-frontend/You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

├── products/           # Product listing & detail pages

├── _providers.tsx      # Global providers (Query, Auth, Theme)├── order/                  # Order store, calc, post-order jobs

└── layout.tsx          # Root layout

├── return/                 # Returns service

components/

├── layout/             # Header, Footer, Navigation├── payment/stripe.ts       # Stripe client + webhook verification

├── products/           # Product cards, filters, search

├── ui/                 # shadcn components (button, dialog, etc.)├── checkout/stripe-webhook.ts  # Webhook event handler### ✅ Phase 4: Product Catalog├── app/

└── ...

├── redis.ts                # Redis client (Upstash + in-memory fallback)

lib/

├── api/                # Mock data & API clients└── admin.ts                # Admin authorization helpers- **Advanced filtering**:

├── cart/               # Cart service & session management

├── order/              # Order calculations, storage, post-order jobs

├── loyalty/            # Loyalty service (accounts, transactions, accrual)

├── routine/            # Routine & diary services

├── media/              # Upload validation & handling

├── content/            # Blog post, category, tag services + sanitization

├── consultation/       # Booking service, calendar generation

├── notifications/      # WhatsApp/Twilio, SMS, email integration

├── payment/            # Stripe integrationtypes/  - Skin type, concerns, brands│   ├── layout.tsx           # Root layout with providersThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

├── return/             # Return service

├── checkout/           # Stripe webhook handler├── cart.ts                 # CartItem, Cart, Identity

├── admin.ts            # Admin authorization

└── redis.ts            # Redis client with fallback├── order.ts                # OrderDraft, Order, OrderStatus, Address  - Price range slider



types/├── return.ts               # ReturnRequest, ReturnItem, ReturnStatus

├── cart.ts             # Cart types

├── order.ts            # Order & draft types

├── loyalty.ts          # Loyalty account & transaction types

├── routine.ts          # Routine, diary entry, skin metrics types

├── content.ts          # Blog post, category, tag, video embed types

├── consultation.ts     # Booking, availability, notification types

└── product.ts              # Product, filters, search params  - In stock availability│   ├── page.tsx             # Home page

├── return.ts           # Return request types

├── loyalty.ts          # Loyalty account & transaction types

└── product.ts          # Product types

tests/- **Search** with debounced input

tests/

├── cart-service.test.ts        # Cart operations (4 tests)

├── checkout-calc.test.ts       # Tax & shipping (1 test)

├── order-search.test.ts        # Order indexing (3 tests)

├── return-service.test.ts      # Returns workflow (5 tests)

├── loyalty-service.test.ts     # Loyalty accrual & redemption (11 tests)

├── routine-service.test.ts     # Routine CRUD (10 tests)

├── diary-service.test.ts       # Diary entries & comparisons (9 tests)

├── media-upload.test.ts        # File upload validation (9 tests)

├── content-service.test.ts     # Blog posts, categories, tags (18 tests)

└── stripe-webhook.test.ts      # Webhook idempotency (2 tests)

```├── return-service.test.ts- **Infinite scroll** with React Query



## 🚦 Getting Started└── stripe-webhook.test.ts



### Prerequisites```- **React Query Devtools** for debugging│   └── _providers.tsx       # React Query & Theme providers



- Node.js 18+

- npm/yarn/pnpm

- (Optional) Redis instance or Upstash account## 🚦 Getting Started- Responsive filters (sidebar desktop, sheet mobile)

- Stripe account for payments



### Installation

### Prerequisites- Product cards with hover effects├── components/To learn more about Next.js, take a look at the following resources:

1. **Clone and install dependencies**:

```bash- Node.js 18+

cd glowup-frontend

npm install- Redis (Upstash recommended; in-memory fallback for local dev)- Badges (New, Best Seller, Discount)

```

- Stripe account (for payments)

2. **Configure environment variables**:

- Rating display│   ├── ui/                  # shadcn/ui components

Create a `.env.local` file (see `.env.example`):

### Installation

```bash

# Auth API

AUTH_API_URL=http://localhost:4000

1. **Install dependencies**

# App URL

NEXT_PUBLIC_SITE_URL=http://localhost:3000```bash## 🛠️ Tech Stack│   │   ├── button.tsx- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.



# Redis (optional for local dev)npm install

REDIS_URL=

REDIS_TOKEN=```



# Stripe

STRIPE_SECRET_KEY=sk_test_...

STRIPE_WEBHOOK_SECRET=whsec_...2. **Environment variables** (`.env.local`)- **Framework**: Next.js 14.2.33 (App Router)│   │   ├── dialog.tsx- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



# Admin```bash

ADMIN_USER_IDS=user_123,user_456

# Backend auth API- **Language**: TypeScript

# Loyalty (optional - defaults provided)

LOYALTY_POINTS_PER_KES=0.01AUTH_API_URL=http://localhost:4000

LOYALTY_REVIEW_BONUS=50

LOYALTY_REFERRAL_BONUS_REFERRER=500NEXT_PUBLIC_SITE_URL=http://localhost:3000- **Styling**: Tailwind CSS│   │   ├── dropdown-menu.tsx

LOYALTY_REFERRAL_BONUS_REFEREE=250

LOYALTY_MIN_REDEEM=100

LOYALTY_POINT_VALUE_KES=1

LOYALTY_EXPIRY_DAYS=365# Redis (optional locally; in-memory fallback if not set)- **UI Components**: shadcn/ui

```

REDIS_URL=https://your-redis.upstash.io

3. **Run development server**:

```bashREDIS_TOKEN=your-token- **Animation**: Framer Motion│   │   ├── toast.tsxYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

npm run dev

```



Visit [http://localhost:3000](http://localhost:3000)# Stripe- **State**: Zustand (UI), TanStack React Query (server)



4. **Run tests**:STRIPE_SECRET_KEY=sk_test_...

```bash

npm run testSTRIPE_WEBHOOK_SECRET=whsec_...- **Forms**: react-hook-form + zod│   │   ├── toaster.tsx

```



## 🛒 Cart Behavior

# Admin users (comma-separated user IDs)- **Carousel**: embla-carousel-react

- **Anonymous users**: Cart stored by `sessionId` (cookie-based)

- **Logged-in users**: Cart stored by `userId`ADMIN_USER_IDS=admin1,admin2

- **On login**: Anonymous cart merges into user cart (additive quantities)

- **TTL**: Carts expire after 7 days of inactivity```- **Theme**: next-themes│   │   └── switch.tsx## Deploy on Vercel

- **Persistence**: Redis with in-memory fallback for local dev



## 💳 Payment Flow

3. **Run development server**- **Images**: Cloudinary

1. Frontend: `POST /api/checkout/intent` → receives `clientSecret` and `draftId`

2. Frontend: Use Stripe.js to confirm payment with `clientSecret````bash

3. Stripe: Sends `payment_intent.succeeded` webhook to `/api/webhooks/stripe`

4. Backend: Finalizes order, clears cart, credits loyalty pointsnpm run dev- **Fonts**: Inter (body), Playfair Display (headings)│   ├── layout/              # Layout components



## 🔄 Returns Flow```



1. Customer: `POST /api/returns` with orderId, items, photos, reasonOpen http://localhost:3000

2. System: Creates return request (status: `pending`), updates order to `return_requested`

3. Admin: `PUT /api/returns/[id]/decision` → approve or deny

4. If approved:

   - Return status → `approved`, order → `return_approved`4. **Run tests**## 📁 Key Files│   │   ├── header.tsx       # Header with mega menuThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

   - Process refund via payment provider

   - Webhook: `POST /api/webhooks/refund` → marks return `refunded`, order `refunded````bash



## 🎁 Loyalty Programnpm test



### Earning Points```



- **Purchases**: Automatically credited after successful payment```│   │   └── footer.tsx       # Footer with newsletter

  - Default: 1 point per 100 KES spent

  - Calculated on final order total (after tax & shipping)## 📄 API Endpoints

  

- **Reviews**: Ready for integration (50 points per review)app/



- **Referrals**: Ready for integration (500 for referrer, 250 for referee)### Cart



### Redeeming Points- `GET /api/cart` - Get current cart (user or session)├── products/page.tsx           # Product catalog with filters & infinite scroll│   ├── auth/                # Authentication componentsCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



1. User requests redemption via `POST /api/loyalty/redeem` or during checkout- `POST /api/cart/items` - Add item `{ productId, title, price, quantity, imageUrl? }`

2. System validates balance and minimum threshold

3. Points deducted immediately- `PUT /api/cart/items/[id]` - Update quantity `{ quantity }`├── auth/login|register|forgot|reset/  # Auth pages

4. Discount applied to order total (1 point = 1 KES)

- `DELETE /api/cart/items/[id]` - Remove item

### Tier System

├── api/auth/*                  # Auth API routes (proxy to backend)│   │   └── auth-modal.tsx   # Sign in/Sign up modal

- **Bronze**: 0-1,999 total earned points

- **Silver**: 2,000-4,999 total earned points### Checkout

- **Gold**: 5,000-9,999 total earned points

- **Platinum**: 10,000+ total earned points- `POST /api/checkout/intent` - Create payment intent├── page.tsx                    # Homepage│   └── theme-toggle.tsx     # Theme switcher



*Tier based on lifetime earned points, not current balance*  - Body: `{ shippingMethod: 'standard'|'express', address: {...} }`



## 🔧 Extending the Platform  - Returns: `{ draftId, clientSecret, amount, currency }`├── layout.tsx                  # Root layout├── store/



### Add Real Email Service



Update `lib/order/post-order.ts`:### Orders└── _providers.tsx              # Global providers│   └── ui-store.ts          # Zustand store for UI state



```typescript- `GET /api/orders` - List user's orders (auth required)

export async function sendOrderConfirmationEmail(email: string, orderId: string) {

  await fetch('https://api.sendgrid.com/v3/mail/send', {- `GET /api/orders/[id]` - Get order details (owner or admin)├── lib/

    method: 'POST',

    headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` },- `PUT /api/orders/[id]/status` - Update status (admin only)

    body: JSON.stringify({

      personalizations: [{ to: [{ email }] }],  - Body: `{ status: 'processing'|'shipped'|'delivered', trackingNumber? }`components/│   ├── utils.ts             # Utility functions

      from: { email: 'orders@glowup.co.ke' },

      subject: `Order Confirmation #${orderId}`,

      content: [{ type: 'text/html', value: '...' }],

    }),### Returns├── products/│   └── config/

  });

}- `POST /api/returns` - Create return request

```

  - Body: `{ orderId, items: [{ orderItemId, productId, title, quantity, reason, photos? }], customerNote? }`│   ├── product-grid-card.tsx   # Product card with hover effects│       └── seo.ts           # SEO configuration

### Implement JWT Token Decoding

- `GET /api/returns/[id]` - Get return details (owner or admin)

Update `lib/admin.ts`:

- `PUT /api/returns/[id]/decision` - Approve/deny (admin only)│   ├── filters-sidebar.tsx     # Desktop filters├── hooks/

```typescript

import jwt from 'jsonwebtoken';  - Body: `{ decision: 'approve'|'deny', adminNote? }`



export function getUserIdFromToken(token: string): string | null {│   ├── filters-sheet.tsx       # Mobile filters drawer│   └── use-toast.ts         # Toast hook

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };### Webhooks

    return decoded.userId;

  } catch {- `POST /api/webhooks/stripe` - Stripe payment webhook (signature verified)│   ├── search-bar.tsx          # Debounced search└── public/                  # Static assets

    return null;

  }- `POST /api/webhooks/refund` - Refund completion webhook

}

```  - Body: `{ eventId, returnId }`│   └── sort-dropdown.tsx       # Sort dropdown```



Then update loyalty and order APIs to use real userId from token.



### Add Review Points Integration## 🔐 Security├── home/



In your reviews API:



```typescript- **Authentication**: HTTP-only cookies (`glowup_token` for auth, `glowup_session` for anonymous cart)│   ├── product-card.tsx        # Homepage product card## 🎨 Design System

import { creditPoints } from '@/lib/loyalty/loyalty-service';

- **Admin Authorization**: Endpoints check `ADMIN_USER_IDS` via `requireAdmin()`

export async function createReview(userId: string, productId: string, rating: number, text: string) {

  // Save review...- **Webhook Verification**: Stripe signature validation on `/api/webhooks/stripe`│   ├── review-carousel.tsx     # Reviews carousel

  

  // Credit loyalty points- **Idempotency**: Payment and refund webhooks check `markEventProcessed(eventId)`

  const rules = getAccrualRules();

  await creditPoints(│   └── social-scroller.tsx     # Social media embeds### Color Palette

    userId,

    rules.reviewBonus,## 🧪 Testing

    'review',

    `Review bonus for product ${productId}`,├── layout/

    { productId }

  );All tests use Vitest with in-memory Redis fallback:

}

``````bash│   ├── header.tsx              # Navigation with mega menuThe design system uses a premium rose gold and champagne color scheme inspired by luxury beauty brands:



### Add Referral Systemnpm test



```typescript```│   └── footer.tsx              # Footer

export async function processReferral(referrerId: string, refereeId: string) {

  const rules = getAccrualRules();

  

  // Credit referrer**Test Coverage**:└── auth/- **Primary**: Rose Gold (#E75B8D) - Used for CTAs and accents

  await creditPoints(

    referrerId,- Cart CRUD, session merge, TTL

    rules.referralBonusReferrer,

    'referral',- Checkout totals calculation (VAT 16%, shipping)    ├── auth-modal.tsx          # Auth modal- **Secondary**: Soft Blush - Subtle background tones

    'Referral bonus',

    { refereeId }- Stripe webhook idempotency

  );

  - Return creation, approval, denial, refund    └── auth-provider.tsx       # Auth context- **Accent**: Champagne Gold - Highlights and special elements

  // Credit referee

  await creditPoints(- Order indexing by user and status

    refereeId,

    rules.referralBonusReferee,

    'referral',

    'Sign-up bonus from referral',## 🎯 Order Lifecycle

    { referrerId }

  );lib/### Typography

}

``````



## 🧪 Testing1. paid (initial)├── api/products.ts             # Product API client (mock data)



Run the full test suite:2. processing (admin updates)



```bash3. shipped (admin adds tracking)├── auth.ts                     # Auth utilities- **Primary Font**: Inter - Clean, modern sans-serif for body text

npm run test

```4. delivered



**Test Coverage**:5. [optional] return_requested → return_approved/denied → refunded├── shimmer.ts                  # Image blur placeholders- **Display Font**: Playfair Display - Elegant serif for headings

- ✅ Cart operations (add, merge, update, remove)

- ✅ Checkout calculations (tax, shipping, points discount)```

- ✅ Loyalty service (earn, redeem, tiers, validation)

- ✅ Order indexing (by user, by status)└── utils.ts                    # General utilities

- ✅ Returns workflow (create, approve, deny, refund)

- ✅ Stripe webhook idempotency## 🔄 Returns Flow



## 📊 Environment Variables## ✨ Features



See `.env.example` for all available configuration options.1. Customer: `POST /api/returns` with order ID, items, photos, reason



### Required for Production2. System: Creates return request (status: `pending`), updates order to `return_requested`types/

- `AUTH_API_URL`

- `REDIS_URL` & `REDIS_TOKEN`3. Admin: `PUT /api/returns/[id]/decision` → approve or deny

- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`

- `ADMIN_USER_IDS`4. If approved:└── product.ts                  # Product types & constants### Phase 1 - Completed ✅



### Optional (with defaults)   - Return status → `approved`, order → `return_approved`

- All `LOYALTY_*` variables have sensible defaults

   - Process refund via payment provider```

## 🚀 Deployment

   - Webhook: `POST /api/webhooks/refund` → marks return `refunded`, order `refunded`

### Vercel (Recommended)

✅ **Project Setup**

1. Push to GitHub

2. Connect to Vercel## 🛒 Cart Behavior

3. Add environment variables

4. Deploy## 🚦 Getting Started- Next.js 14 with App Router



### Docker- **Anonymous users**: Cart stored by `sessionId` (cookie-based)



```dockerfile- **Logged-in users**: Cart stored by `userId`- TypeScript configuration

FROM node:18-alpine

WORKDIR /app- **On login**: Anonymous cart merges into user cart (additive quantities)

COPY package*.json ./

RUN npm install- **TTL**: Carts expire after 7 days of inactivity### Prerequisites- Tailwind CSS with custom design system

COPY . .

RUN npm run build

CMD ["npm", "start"]

```## 💳 Payment Flow```bash- shadcn/ui component library



## 📝 Known Issues & Notes



- **Mock Cloudinary images**: URLs return 404 but don't affect functionality1. Frontend: `POST /api/checkout/intent` → receives `clientSecret`Node.js 18+ and npm

- **CSS linter warnings**: `@tailwind` and `@apply` warnings are harmless

- **JWT decoding**: Currently uses placeholder userId - implement JWT verification2. Frontend: Use Stripe.js to confirm payment with `clientSecret`

- **Inventory management**: Post-order inventory decrement is stubbed

- **Email service**: Order confirmation emails are stubbed3. Stripe: Sends `payment_intent.succeeded` webhook to `/api/webhooks/stripe````✅ **Core Components**



## 🛣️ Roadmap4. Backend: Finalizes order, clears cart, triggers post-order jobs



### Immediate Next Steps- Responsive Header with mega menu navigation

- [ ] Implement JWT token decoding in loyalty/order APIs

- [ ] Add product review system with loyalty integration## 🔧 Extending

- [ ] Build referral code system

- [ ] Create user dashboard for loyalty points management### Installation- Footer with newsletter signup and social links

- [ ] Add loyalty points history UI

### Add Real Email Service

### Future Enhancements

- [ ] Real-time inventory trackingUpdate `lib/order/post-order.ts`:- Authentication modal (Sign In/Sign Up)

- [ ] Email service integration (SendGrid/Postmark)

- [ ] SMS notifications for orders```typescript

- [ ] Advanced product recommendations

- [ ] Wishlist functionalityexport async function sendOrderConfirmationEmail(email: string, orderId: string) {1. **Install dependencies**- Theme switcher (Light/Dark mode)

- [ ] Social media authentication

- [ ] Mobile app (React Native)  await fetch('https://api.sendgrid.com/v3/mail/send', {



## 🤝 Contributing    method: 'POST',```bash- Toast notification system



This is a portfolio project, but feel free to:    headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` },

- Fork and experiment

- Open issues for bugs    body: JSON.stringify({ /* email payload */ }),npm install

- Suggest improvements

  });

## 📄 License

}```✅ **State Management**

MIT License - feel free to use for learning and portfolio purposes.

```

---

- Zustand store for UI state

**Built with ❤️ for the beauty community in Kenya** 🇰🇪

### Add Inventory Service

Update `decrementInventory()` to call your inventory API or database.2. **Set up environment variables**- React Query setup for data fetching



### JWT Decode for userId- Theme provider for dark mode

Replace placeholder in `lib/admin.ts`:

```typescriptCreate `.env.local`:

import jwt from 'jsonwebtoken';

```env✅ **Design System**

export function getUserIdFromToken(): string | undefined {

  const token = getAuthToken();AUTH_API_URL=http://localhost:8000- Premium color palette

  if (!token) return undefined;

  const decoded = jwt.decode(token) as { userId?: string };NEXT_PUBLIC_SITE_URL=http://localhost:3000- Custom animations

  return decoded?.userId;

}```- Responsive layouts

```

- Smooth transitions

## 📝 Development Notes

3. **Run development server**

- **Mock Data**: Product catalog uses mock data in `lib/api/products.ts`

- **Cloudinary Images**: Some demo images return 404 (replace with real URLs)```bash## 🚀 Getting Started

- **Redis Fallback**: In-memory KV store used if `REDIS_URL` not set

- **Admin Users**: Set `ADMIN_USER_IDS` to comma-separated list of real user IDs from your auth systemnpm run dev



## 🤝 Contributing```### Prerequisites



Portfolio project - feel free to fork and customize!



## 📄 LicenseOpen [http://localhost:3000](http://localhost:3000)- Node.js 18+ 



Private portfolio project.- npm or yarn



---## 📄 Pages



**Built with ❤️ for the beauty community in Kenya** 🇰🇪### Installation


- **`/`** - Homepage (hero, products, reviews, social)

- **`/products`** - Product catalog (filters, search, infinite scroll)1. Install dependencies:

- **`/auth/login`** - Login```bash

- **`/auth/register`** - Registrationnpm install

- **`/auth/forgot`** - Forgot password```

- **`/auth/reset`** - Reset password

- **`/profile`** - Protected user profile2. Run the development server:

```bash

## 🔐 Authenticationnpm run dev

```

1. User submits login/register form

2. Frontend → `/api/auth/login` → Backend3. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Backend returns token

4. API route sets HTTP-only cookie## 📝 Available Scripts

5. AuthProvider fetches user from `/api/auth/me`

6. Middleware protects `/profile/*` routes- `npm run dev` - Start development server

- `npm run build` - Build for production

## 🛒 Product Catalog- `npm start` - Start production server

- `npm run lint` - Run ESLint

### Filters

- Skin Type (Dry, Oily, Combination, Normal, Sensitive)## 🎯 Key Features

- Skin Concerns (Acne, Dark Spots, Anti-Aging, etc.)

- Brands (GlowUp, Fenty Beauty, The Ordinary, etc.)### Header Component

- Price Range (KES 0-10,000)- Responsive mega menu navigation

- In Stock Only- Product category dropdowns (Skincare, Makeup, Wellness)

- Search functionality placeholder

### Features- Shopping cart badge

- **Search**: Debounced (300ms), searches title/description/brand/tags- User authentication access

- **Sort**: Popularity, Newest, Price (asc/desc), Rating- Mobile-friendly drawer menu

- **Infinite Scroll**: Auto-loads 12 products per page

- **Responsive**: Sidebar (desktop) / Sheet drawer (mobile)### Footer Component

- **React Query**: Caching, optimistic updates, devtools- Newsletter subscription form

- Quick links (Shop, Help, About)

### Product Card- Social media integration (Instagram, Twitter, Facebook)

- 3:4 aspect ratio- Legal links (Privacy, Terms, Accessibility)

- Shimmer loading placeholder

- Badges (New, Best Seller, Discount %)### Auth Modal

- Quick actions on hover (Favorite, Add to cart)- Toggle between Sign In and Sign Up

- Rating + review count- Social authentication options (Google, Apple)

- Price with strikethrough original- Smooth transitions with Framer Motion

- Form validation ready

## 🧪 React Query Devtools

### Theme System

Press floating icon (bottom-left) to inspect queries, cache, and network.- Light and Dark modes

- System preference detection

## 🎨 Design System- Smooth theme transitions with animations

- Persistent theme selection

- **Primary**: Rose Gold (#E75B8D)

- **Secondary**: Soft Blush (#F8B4D9)## 🔄 Next Steps (Phase 2)

- **Accent**: Champagne (#C9A96E)

- **Fonts**: Playfair Display (headings), Inter (body)- [ ] Product listing and detail pages

- **Dark/Light**: System-aware themes- [ ] Shopping cart functionality

- [ ] User authentication (backend integration)

## 🔧 API Integration- [ ] Product filtering and search

- [ ] Checkout flow

Currently using mock data. Replace `lib/api/products.ts` to integrate real backend:- [ ] User profile and order history

- [ ] Product reviews and ratings

```typescript- [ ] Wishlist functionality

export async function fetchProducts(params: ProductSearchParams) {

  const response = await fetch(## 🤝 Contributing

    `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`

  );This is a portfolio project. Feel free to fork and customize for your own needs!

  return response.json();

}## 📄 License

```

MIT License - feel free to use this project for your portfolio or learning purposes.

Expected response:

```typescript## 🎨 Design Inspiration

{

  products: Product[],- **Fenty Beauty** - Bold, inclusive, modern aesthetic

  total: number,- **Sephora** - Clean navigation and product organization

  page: number,- **Glossier** - Minimalist, elegant design approach

  pageSize: number,

  hasMore: boolean---

}

```Built with ❤️ using Next.js 14 and modern web technologies


## 🎯 Next Steps

### Phase 5: Product Detail Page
- Individual product pages
- Image gallery with zoom
- Size/variant selection
- Add to cart
- Related products
- Reviews section

### Phase 6: Shopping Cart
- Cart state (Zustand)
- Cart drawer
- Quantity controls
- Persistence

### Phase 7: Checkout
- Multi-step checkout
- Address form
- M-Pesa/Card payment
- Order confirmation

### Phase 8: User Dashboard
- Order history
- Wishlist
- Saved addresses
- Account settings

## 📝 Notes

- CSS linter warnings about `@tailwind` are harmless
- Mock data in `lib/api/products.ts` (8 sample products)
- React Query cache: 60s stale time
- Search debounce: 300ms
- Images optimized via Cloudinary

## 🤝 Contributing

Portfolio project - feel free to fork!

---

**Built with ❤️ for the beauty community in Kenya** 🇰🇪
# glowup-frontend
