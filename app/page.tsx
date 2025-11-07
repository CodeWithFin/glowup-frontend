'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard, type Product } from '@/components/home/product-card';
import { ReviewCarousel, type Review } from '@/components/home/review-carousel';
import { SocialScroller } from '@/components/home/social-scroller';

const CLOUD = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto';

const bestSellers: Product[] = [
  { id: 'b1', title: 'Radiance Serum', price: 2450, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/sample.jpg`, tag: 'Bestseller' },
  { id: 'b2', title: 'Hydra Balm', price: 1850, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_saturation:15/sample.jpg` },
  { id: 'b3', title: 'Glow Tint', price: 2150, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_brightness:5/sample.jpg` },
  { id: 'b4', title: 'Velvet Lip', price: 1450, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_contrast:10/sample.jpg` },
];

const newArrivals: Product[] = [
  { id: 'n1', title: 'Vitamin C Drops', price: 2650, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_colorize:10/sample.jpg`, tag: 'New' },
  { id: 'n2', title: 'Ceramide Cream', price: 2950, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_saturation:10/sample.jpg` },
  { id: 'n3', title: 'Rose Mist', price: 1550, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_tint:50:ffb3c7/sample.jpg` },
  { id: 'n4', title: 'Clay Cleanser', price: 1750, imageUrl: `${CLOUD}/w_800,h_1000,c_fill,g_auto/e_gamma:120/sample.jpg` },
];

const reviews: Review[] = [
  { id: 'r1', name: 'Amina', rating: 5, text: 'My skin has never felt this hydrated. Instant glow!' },
  { id: 'r2', name: 'Zuri', rating: 5, text: 'Inclusive shades and beautiful texture — I’m obsessed.' },
  { id: 'r3', name: 'Wanjiru', rating: 4, text: 'Love the serum. Gentle and effective for daily use.' },
  { id: 'r4', name: 'Kendi', rating: 5, text: 'The lip velvet is stunning and long-lasting.' },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero – dark skin-positivity aesthetic */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-black via-zinc-900 to-background text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
                Skin-positivity for every tone
              </span>
              <h1 className="mt-4 font-playfair text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Celebrate Your Shade
              </h1>
              <p className="mt-4 text-lg text-zinc-300 md:text-xl max-w-xl">
                Clean, conscious beauty crafted for melanin-rich skin. Hydrating textures, inclusive shades, undeniable glow.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group">
                  Shop Best Sellers
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Explore New Arrivals
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
              <div className="relative h-[420px] md:h-[560px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Image
                  src={`${CLOUD}/w_1400,h_1000,c_fill,g_auto/e_saturation:20/sample.jpg`}
                  alt="Beauty models with glowing skin"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-14 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold">Best Sellers</h2>
              <p className="text-muted-foreground mt-1">Our community’s most-loved picks</p>
            </div>
            <Link href="#" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-8 md:py-14 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold">New Arrivals</h2>
              <p className="text-muted-foreground mt-1">Fresh drops curated for your routine</p>
            </div>
            <Link href="#" className="text-sm text-primary hover:underline">Shop new in</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients Education Preview */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold">Ingredients that Work</h2>
            <p className="text-muted-foreground mt-2">Science-backed actives tailored for your glow goals</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[{
              name: 'Niacinamide', desc: 'Balances oil, fades dark spots, and strengthens your barrier.', img: `${CLOUD}/w_800,h_600,c_fill,g_auto/e_tint:20:ff9fd6/sample.jpg`
            },{
              name: 'Hyaluronic Acid', desc: 'Deep hydration with multi-weight molecules.', img: `${CLOUD}/w_800,h_600,c_fill,g_auto/e_brightness:8/sample.jpg`
            },{
              name: 'Vitamin C', desc: 'Brightens and protects for a lit-from-within glow.', img: `${CLOUD}/w_800,h_600,c_fill,g_auto/e_saturation:25/sample.jpg`
            }].map((ing) => (
              <motion.div key={ing.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-2xl overflow-hidden border">
                <div className="relative h-56">
                  <Image src={ing.img} alt={ing.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{ing.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{ing.desc}</p>
                  <Link href="#" className="inline-flex items-center text-sm text-primary mt-4 hover:underline">Learn more →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Carousel */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold">What GlowUp Loves Say</h2>
            <span className="text-sm text-muted-foreground">4.9/5 average rating</span>
          </div>
          <ReviewCarousel reviews={reviews} />
        </div>
      </section>

      {/* TikTok / IG Scroller */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold">From the Community</h2>
            <Link href="#" className="text-sm text-primary hover:underline">Follow @glowup</Link>
          </div>
          <SocialScroller />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative overflow-hidden bg-primary py-14 md:py-20 text-primary-foreground">
        <div className="container px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold">Your Glow, Your Story</h2>
            <p className="text-primary-foreground/90">Join the Glow Squad and unlock exclusive drops and beauty tips.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">Create Account</Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">Shop Now</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
