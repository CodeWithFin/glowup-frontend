"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { shimmer, toBase64 } from "@/lib/shimmer";

export type Product = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  tag?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden">
        <div className="relative">
          <AspectRatio ratio={3 / 4}>
            {!loaded && <Skeleton className="absolute inset-0" />}
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 933))}`}
              onLoad={() => setLoaded(true)}
            />
          </AspectRatio>
          {product.tag && (
            <Badge className="absolute left-2 top-2 bg-primary/90">{product.tag}</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium leading-tight">{product.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">KSh {product.price.toLocaleString()}</p>
            </div>
            <Button size="sm">Add</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
