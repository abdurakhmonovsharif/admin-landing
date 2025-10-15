import { z } from "zod";

export const appointmentServiceFormSchema = z.object({
  appointmentId: z
    .coerce
    .number()
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Appointment tanlang",
    }),
  locationId: z
    .coerce
    .number()
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Joy tanlang",
    }),
  titleUz: z.string().min(1, { message: "Majburiy" }),
  titleRu: z.string().optional().or(z.literal("")),
  titleEn: z.string().optional().or(z.literal("")),
  descriptionUz: z.string().optional().or(z.literal("")),
  descriptionRu: z.string().optional().or(z.literal("")),
  descriptionEn: z.string().optional().or(z.literal("")),
  date: z.string().min(1, { message: "Sana majburiy" }),
  time: z.string().min(1, { message: "Vaqt majburiy" }),
});

export type AppointmentServiceFormValues = z.infer<typeof appointmentServiceFormSchema>;
