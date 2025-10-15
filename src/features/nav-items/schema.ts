import { z } from "zod";

export const navItemFormSchema = z.object({
  nameUz: z.string().min(1, { message: "Majburiy" }),
  nameRu: z.string().optional().or(z.literal("")),
  nameEn: z.string().optional().or(z.literal("")),
  slug: z.string().min(1, { message: "Slag kerak" }),
  parentId: z.number().optional().nullable(),
});

export type NavItemFormValues = z.infer<typeof navItemFormSchema>;
