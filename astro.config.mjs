// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
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
    weights: [100, 300, 400, 600, 700, 900],
    styles: ["normal"]
  },
  {
    name: "Yuyu",
    cssVariable: "--font-yuyu",
    provider: fontProviders.google(),
    weights: [100, 300, 400, 600, 700, 900],
    styles: ["normal"],

  }]
});
