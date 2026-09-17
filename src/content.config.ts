import { defineCollection, z } from "astro:content";

const guides = defineCollection({
  type: "content",
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
