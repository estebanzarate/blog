// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
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
    styles: ["normal", "italic"],
  },
  {
    name: "DejaVu Mono",
    cssVariable: "--font-dejavu",
    provider: fontProviders.fontsource(),
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal", "italic"],

  },
  {
    name: "Victor Mono",
    cssVariable: "--font-victor",
    provider: fontProviders.google(),
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal", "italic"],

  },
  ],
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            content: { type: 'text' },
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
          }
        ],
      ]
    }),
  },
});
