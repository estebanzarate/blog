// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog-estebanzarate.vercel.app',
  adapter: vercel({
    imageService: true,
  }),
  prefetch: {
    defaultStrategy: 'viewport'
  },
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
      fallbackType: "rewrite"
    },
    fallback: {
      en: "es"
    },
  },
  fonts: [{
    name: "Neucha",
    cssVariable: "--font-neucha",
    provider: fontProviders.google(),
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal"]
  },
  {
    name: "DejaVu Sans",
    cssVariable: "--font-dejavu",
    provider: fontProviders.fontsource(),
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal"],

  }]
});
