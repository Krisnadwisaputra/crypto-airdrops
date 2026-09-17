import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const guides = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/guides"
  }),

  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    tag: z.string(),
    author: z.string().default("Krisna Dwi Saputra"),
    reviewed: z.string(),
    datePublished: z.string(),
    dateModified: z.string(),
    ogDescription: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    ).default([])
  })
});

export const collections = {
  guides
};
