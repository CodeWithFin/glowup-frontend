"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import Script from "next/script";

export function SocialScroller() {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });

  // Embeds will self-initialize when their script loads
  useEffect(() => {}, []);

  return (
    <div className="relative">
      {/* TikTok & Instagram embed scripts */}
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {/* TikTok Example */}
          <div className="pl-4 basis-80 md:basis-96">
            <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@scout2015/video/6718335390845095173" data-video-id="6718335390845095173" style={{ maxWidth: 320, minWidth: 220 }}>
              <section> </section>
            </blockquote>
          </div>

          {/* Instagram Example */}
          <div className="pl-4 basis-80 md:basis-96">
            <blockquote className="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/CxwQj9gr8tF/" data-instgrm-version="14" style={{ background: '#FFF', border: 0, borderRadius: 3, boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth: 320, minWidth: 220, padding: 0, width: '100%' }}>
              <div />
            </blockquote>
          </div>

          {/* Add more embeds as desired */}
          <div className="pl-4 basis-80 md:basis-96">
            <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@tiktok/video/6807491984882765062" data-video-id="6807491984882765062" style={{ maxWidth: 320, minWidth: 220 }}>
              <section> </section>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
