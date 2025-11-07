"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

export type Review = {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number; // 1-5
  text: string;
};

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {reviews.map((r) => (
            <motion.div key={r.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {r.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="flex items-center text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? '' : 'text-muted-foreground/40'}`} fill={i < r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={scrollPrev} className="h-9 w-9 rounded-full border flex items-center justify-center">‹</button>
        <button onClick={scrollNext} className="h-9 w-9 rounded-full border flex items-center justify-center">›</button>
      </div>
    </div>
  );
}
