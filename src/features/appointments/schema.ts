import { z } from "zod";

export const appointmentFormSchema = z.object({
  type: z.enum(["personality", "store"]),
  titleUz: z.string().min(1, { message: "Majburiy" }),
  titleRu: z.string().optional().or(z.literal("")),
  titleEn: z.string().optional().or(z.literal("")),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
