import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const post = defineCollection({
    loader: glob({ base: './src/content/', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) => z.object({
        type: z.enum(['post', 'writeup']),
        title: z.string(),
        description: z.string().optional(),
        lang: z.enum(['en', 'es']),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),

        image: image().optional(),
        platform: z.enum(['hackthebox', 'dockerlabs']).optional(),
        url: z.string().optional(),
        difficulty: z.enum(['muyfacil', 'veryeasy', 'easy', 'medium', 'hard', 'insane']).optional(),
        os: z.enum(["linux", "windows"]).optional(),
        hints: z.array(z.string()).optional(),
    }),
});

export const collections = { post };