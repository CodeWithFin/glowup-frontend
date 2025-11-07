'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingBag, User, X, LogOut, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUIStore } from '@/store/ui-store';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const megaMenuCategories = {
  skincare: {
    title: 'Skincare',
    sections: [
      {
        title: 'By Concern',
        items: ['Acne & Blemishes', 'Anti-Aging', 'Dark Spots', 'Hydration', 'Sensitivity'],
      },
      {
        title: 'By Product',
        items: ['Cleansers', 'Serums', 'Moisturizers', 'Masks', 'Eye Care'],
      },
      {
        title: 'Collections',
        items: ['New Arrivals', 'Best Sellers', 'Clean Beauty', 'K-Beauty', 'Luxury'],
      },
    ],
  },
  makeup: {
    title: 'Makeup',
    sections: [
      {
        title: 'Face',
        items: ['Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer'],
      },
      {
        title: 'Eyes',
        items: ['Eyeshadow', 'Eyeliner', 'Mascara', 'Brows', 'Eye Primer'],
      },
      {
        title: 'Lips',
        items: ['Lipstick', 'Lip Gloss', 'Lip Liner', 'Lip Balm', 'Lip Stain'],
      },
    ],
  },
  wellness: {
    title: 'Wellness',
    sections: [
      {
        title: 'Self-Care',
        items: ['Bath & Body', 'Aromatherapy', 'Supplements', 'Tools', 'Gift Sets'],
      },
      {
        title: 'Hair Care',
        items: ['Shampoo', 'Conditioner', 'Treatments', 'Styling', 'Tools'],
      },
    ],
  },
};

export function Header() {
  const { openAuthModal, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          >
            GlowUp
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/products" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Shop All
          </Link>
          {Object.entries(megaMenuCategories).map(([key, category]) => (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setActiveMegaMenu(key)}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button className="text-sm font-medium transition-colors hover:text-primary">
                {category.title}
              </button>
              
              <AnimatePresence>
                {activeMegaMenu === key && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-4"
                  >
                    <div className="w-[600px] rounded-lg border bg-card p-6 shadow-lg">
                      <div className="grid grid-cols-3 gap-6">
                        {category.sections.map((section) => (
                          <div key={section.title}>
                            <h3 className="font-semibold text-sm mb-3 text-primary">
                              {section.title}
                            </h3>
                            <ul className="space-y-2">
                              {section.items.map((item) => (
                                <li key={item}>
                                  <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
          
          <ThemeToggle />

          {/* User */}
          {!user ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex" onClick={() => openAuthModal('signin')}>
              <User className="h-4 w-4" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? user.email} />
                    <AvatarFallback>
                      {(user.name ?? user.email).slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {(user.name ?? user.email).slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <div className="text-sm font-medium truncate">{user.name ?? 'Account'}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full flex items-center">
                    <User2 className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              0
            </span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t overflow-hidden"
          >
            <nav className="container py-6 px-4 space-y-4">
              {Object.entries(megaMenuCategories).map(([key, category]) => (
                <Link
                  key={key}
                  href="#"
                  className="block text-lg font-medium hover:text-primary transition-colors"
                  onClick={closeMobileMenu}
                >
                  {category.title}
                </Link>
              ))}
              <Link
                href="/about"
                className="block text-lg font-medium hover:text-primary transition-colors"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  openAuthModal('signin');
                  closeMobileMenu();
                }}
              >
                Sign In
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
