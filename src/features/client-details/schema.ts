import { z } from "zod";

export const clientDetailsFormSchema = z.object({
  serviceId: z
    .coerce
    .number()
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Xizmat tanlang",
    }),
  firstname: z.string().min(1, { message: "Majburiy" }),
  lastname: z.string().min(1, { message: "Majburiy" }),
  email: z.string().email("Email formatida bo‘lishi kerak"),
  phoneNumber: z.string().min(1, { message: "Telefon majburiy" }),
  address: z.string().optional().or(z.literal("")),
  comment: z.string().optional().or(z.literal("")),
});

export type ClientDetailsFormValues = z.infer<typeof clientDetailsFormSchema>;
