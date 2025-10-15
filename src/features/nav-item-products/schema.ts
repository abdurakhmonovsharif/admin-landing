import { z } from "zod";

export const navItemProductFormSchema = z.object({
  navItemId: z.number().optional().nullable(),
  parentId: z.number().optional().nullable(),
  img: z.string().trim().optional().or(z.literal("")),
  link: z.string().trim().optional().or(z.literal("")),
});

export type NavItemProductFormValues = z.infer<typeof navItemProductFormSchema>;
