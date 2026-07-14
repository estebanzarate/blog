import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const post = defineCollection({
    loader: glob({ base: './src/posts/', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        lang: z.enum(['en', 'es']),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),

        platform: z.string().optional(),
        difficulty: z.string().optional(),
        hints: z.array(z.string()).optional(),
    }),
});

export const collections = { post };