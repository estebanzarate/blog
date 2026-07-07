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
    }),
});

const writeup = defineCollection({
    loader: glob({ base: './src/posts/writeups', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        platform: z.string(),
        difficulty: z.string(),
        hints: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
    }),
});

export const collections = { post, writeup };