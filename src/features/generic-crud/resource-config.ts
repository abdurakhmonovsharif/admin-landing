import { z } from "zod";
import { formatDateTime, formatDate } from "@/lib/formatters";
import {
  AboutControllerService,
  ContactControllerService,
  FamousControllerService,
  GalleryControllerService,
  JobRequestControllerService,
  JournalControllerService,
  LocationControllerService,
  NewsControllerService,
  UserEmailControllerService,
  VacancyControllerService,
} from "@/lib/api/client";
import type { About } from "@/lib/api/models/About";
import type { Contact } from "@/lib/api/models/Contact";
import type { Famous } from "@/lib/api/models/Famous";
import type { Gallery } from "@/lib/api/models/Gallery";
import type { JobRequest } from "@/lib/api/models/JobRequest";
import type { Journal } from "@/lib/api/models/Journal";
import type { Location } from "@/lib/api/models/Location";
import type { LocalTime } from "@/lib/api/models/LocalTime";
import type { News } from "@/lib/api/models/News";
import type { UserEmail } from "@/lib/api/models/UserEmail";
import type { Vacancy } from "@/lib/api/models/Vacancy";
import { localTimeToString } from "@/lib/time";
import type { ResourceConfig, ResourceKey } from "./types";

type RegionOption = {
  value: string;
  labels: { en: string; uz: string; ru: string };
  aliases: string[];
};

const REGION_OPTIONS = [
  { value: "Andijan", labels: { en: "Andijan", uz: "Andijon", ru: "Андижан" }, aliases: ["andijan", "andijon"] },
  { value: "Bukhara", labels: { en: "Bukhara", uz: "Buxoro", ru: "Бухара" }, aliases: ["bukhara", "buxoro"] },
  {
    value: "Fergana",
    labels: { en: "Fergana", uz: "Farg'ona", ru: "Фергана" },
    aliases: ["fergana", "farg'ona", "fargona"],
  },
  { value: "Jizzakh", labels: { en: "Jizzakh", uz: "Jizzax", ru: "Джизак" }, aliases: ["jizzakh", "jizzax"] },
  {
    value: "Kashkadarya",
    labels: { en: "Kashkadarya", uz: "Qashqadaryo", ru: "Кашкадарья" },
    aliases: ["kashkadarya", "qashqadaryo"],
  },
  { value: "Khorezm", labels: { en: "Khorezm", uz: "Xorazm", ru: "Хорезм" }, aliases: ["khorezm", "xorazm"] },
  { value: "Namangan", labels: { en: "Namangan", uz: "Namangan", ru: "Наманган" }, aliases: ["namangan"] },
  { value: "Navoi", labels: { en: "Navoi", uz: "Navoiy", ru: "Навои" }, aliases: ["navoi", "navoiy"] },
  {
    value: "Samarkand",
    labels: { en: "Samarkand", uz: "Samarqand", ru: "Самарканд" },
    aliases: ["samarkand", "samarqand"],
  },
  {
    value: "Surkhandarya",
    labels: { en: "Surkhandarya", uz: "Surxondaryo", ru: "Сурхандарья" },
    aliases: ["surkhandarya", "surxondaryo"],
  },
  { value: "Syrdarya", labels: { en: "Syrdarya", uz: "Sirdaryo", ru: "Сырдарья" }, aliases: ["syrdarya", "sirdaryo"] },
  {
    value: "Tashkent Region",
    labels: { en: "Tashkent Region", uz: "Toshkent viloyati", ru: "Ташкентская область" },
    aliases: ["tashkent region", "toshkent viloyati"],
  },
  {
    value: "Karakalpakstan",
    labels: { en: "Karakalpakstan", uz: "Qoraqalpog'iston", ru: "Каракалпакстан" },
    aliases: ["karakalpakstan", "qoraqalpog'iston"],
  },
  {
    value: "Tashkent City",
    labels: { en: "Tashkent City", uz: "Toshkent shahri", ru: "Город Ташкент" },
    aliases: ["tashkent city", "tashkent"],
  },
] as const satisfies readonly RegionOption[];

type RegionValue = (typeof REGION_OPTIONS)[number]["value"];

const REGION_VALUE_ENUM = z.enum(
  REGION_OPTIONS.map((option) => option.value) as [RegionValue, ...RegionValue[]]
);

const multilingualText = (label: string, required = true) => ({
  [`${label}Uz`]: required
    ? z.string().min(1, { message: "Majburiy" })
    : z.string().optional().or(z.literal("")),
  [`${label}Ru`]: z.string().optional().or(z.literal("")),
  [`${label}En`]: z.string().optional().or(z.literal("")),
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const getStringField = (value: unknown, key: string): string | undefined => {
  const record = asRecord(value);
  const field = record?.[key];
  return typeof field === "string" ? field : undefined;
};

const getBooleanField = (value: unknown, key: string): boolean | undefined => {
  const record = asRecord(value);
  const field = record?.[key];
  return typeof field === "boolean" ? field : undefined;
};

const getStringArrayField = (value: unknown, key: string): string[] => {
  const record = asRecord(value);
  const field = record?.[key];
  return Array.isArray(field) ? (field as string[]) : [];
};

const CONTACT_SOCIAL_PLATFORMS = ["instagram", "linkedin", "telegram", "youtube"] as const;
const CONTACT_SOCIAL_PLATFORM_SET = new Set<string>(CONTACT_SOCIAL_PLATFORMS);
const CONTACT_SOCIAL_PLATFORM_SCHEMA = z.enum(CONTACT_SOCIAL_PLATFORMS, {
  message: "Platformani tanlang",
});

const REGION_LABEL_LOOKUP = new Map<string, string>(
  REGION_OPTIONS.map((option) => [option.value, option.labels.uz])
);

const REGION_SELECT_OPTIONS = REGION_OPTIONS.map((option) => ({
  value: option.value,
  label: option.labels.uz,
}));

const getLocalTimeField = (value: unknown, key: string): unknown => {
  const record = asRecord(value);
  const field = record?.[key];
  if (typeof field === "object" && field !== null) {
    return field;
  }
  if (typeof field === "string") {
    return field;
  }
  return undefined;
};

const toDateInputValue = (value?: string | null): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  return match ? match[1] : "";
};

const toOffsetDateTimeString = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00Z`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return undefined;
};

const resourceConfigs: Record<ResourceKey, ResourceConfig> = {
  about: {
    key: "about",
    title: "About bo‘limi",
    description: "Fonon haqida ma’lumotlar bloki.",
    columns: [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "titleUz",
        header: "Sarlavha (UZ)",
      },
      {
        accessorKey: "slug",
        header: "Slug",
      },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
      {
        accessorKey: "updatedAt",
        header: "Yangilandi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "updatedAt")),
      },
    ],
    schema: z.object({
      ...multilingualText("title"),
      ...multilingualText("body"),
      slug: z.string().min(1, { message: "Slug majburiy" }),
      images: z
        .array(
          z.string().min(1, {
            message: "Rasm URL bo‘sh bo‘lishi mumkin emas",
          })
        )
        .default([]),
    }),
    defaultValues: {
      titleUz: "",
      titleRu: "",
      titleEn: "",
      bodyUz: "",
      bodyRu: "",
      bodyEn: "",
      slug: "",
      images: [],
    },
    toFormValues: (record) => {
      const data = (record as Record<string, unknown>) ?? {};
      const { body_uz, body_ru, body_en, ...rest } = data;
      const bodyUzValue = getStringField(data, "bodyUz") ?? (typeof body_uz === "string" ? body_uz : undefined);
      const bodyRuValue = getStringField(data, "bodyRu") ?? (typeof body_ru === "string" ? body_ru : undefined);
      const bodyEnValue = getStringField(data, "bodyEn") ?? (typeof body_en === "string" ? body_en : undefined);
      const slugValue = getStringField(data, "slug") ?? "";

      return {
        ...rest,
        bodyUz: bodyUzValue ?? "",
        bodyRu: bodyRuValue ?? "",
        bodyEn: bodyEnValue ?? "",
        slug: slugValue,
      };
    },
    fields: [
      { type: "multilingual", baseName: "title", label: "Sarlavha", required: true },
      {
        type: "multilingual",
        baseName: "body",
        label: "Matn",
        kind: "editor",
        required: true,
        uploadCategory: "about",
      },
      { type: "text", name: "slug", label: "Slug", required: true, placeholder: "about-slug" },
      {
        type: "media-upload",
        name: "images",
        label: "Rasmlar",
        uploadCategory: "about",
        mode: "multiple",
        accept: "image/*",
        helperText: "Rasmlar tanlanganda darhol yuklanadi, kerak bo‘lsa ro‘yxatdan o‘chirib tashlang.",
      },
    ],
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const titleUz = getStringField(data, "titleUz") ?? "";
      const titleRu = getStringField(data, "titleRu");
      const titleEn = getStringField(data, "titleEn");
      const bodyUz = getStringField(data, "bodyUz") ?? "";
      const bodyRu = getStringField(data, "bodyRu");
      const bodyEn = getStringField(data, "bodyEn");
      const slug = getStringField(data, "slug") ?? "";
      const images = getStringArrayField(data, "images");

      return {
        titleUz,
        titleRu: titleRu || undefined,
        titleEn: titleEn || undefined,
        bodyUz,
        bodyRu: bodyRu || undefined,
        bodyEn: bodyEn || undefined,
        slug,
        body_uz: bodyUz,
        body_ru: bodyRu || undefined,
        body_en: bodyEn || undefined,
        images,
      } satisfies Partial<About> & {
        body_uz?: string;
        body_ru?: string;
        body_en?: string;
      };
    },
    service: {
      list: () => AboutControllerService.list14(),
      get: (id: number) => AboutControllerService.get14({ id }),
      create: (data: Record<string, unknown>) =>
        AboutControllerService.create14({ requestBody: data as About }),
      update: (id: number, data: Record<string, unknown>) =>
        AboutControllerService.update14({ id, requestBody: data as About }),
      remove: (id: number) => AboutControllerService.delete14({ id }),
    },
  },
  news: {
    key: "news",
    title: "Yangiliklar",
    description: "Yangiliklarni boshqarish.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "titleUz", header: "Sarlavha (UZ)" },
      { accessorKey: "slug", header: "Slug" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "publishedAt",
        header: "E’lon qilingan",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "publishedAt")),
      },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      ...multilingualText("title"),
      ...multilingualText("body"),
      images: z
        .array(
          z.string().min(1, {
            message: "Rasm URL bo‘sh bo‘lishi mumkin emas",
          })
        )
        .default([]),
      publishedAt: z.string().optional().or(z.literal("")),
    }),
    defaultValues: {
      titleUz: "",
      titleRu: "",
      titleEn: "",
      bodyUz: "",
      bodyRu: "",
      bodyEn: "",
      images: [],
      publishedAt: "",
    },
    fields: [
      { type: "multilingual", baseName: "title", label: "Sarlavha", required: true },
      {
        type: "multilingual",
        baseName: "body",
        label: "Matn",
        kind: "editor",
        required: true,
        uploadCategory: "news",
      },
      {
        type: "media-upload",
        name: "images",
        label: "Rasmlar",
        uploadCategory: "news",
        mode: "multiple",
        accept: "image/*",
        helperText: "Rasmlar tanlanganda darhol yuklanadi, kerak bo‘lsa ro‘yxatdan o‘chirib tashlang.",
      },
      { type: "date", name: "publishedAt", label: "E’lon sanasi" },
    ],
    toFormValues: (record) => {
      const item = (record as Partial<News>) ?? {};
      return {
        titleUz: typeof item.titleUz === "string" ? item.titleUz : "",
        titleRu: typeof item.titleRu === "string" ? item.titleRu : "",
        titleEn: typeof item.titleEn === "string" ? item.titleEn : "",
        bodyUz: typeof item.bodyUz === "string" ? item.bodyUz : "",
        bodyRu: typeof item.bodyRu === "string" ? item.bodyRu : "",
        bodyEn: typeof item.bodyEn === "string" ? item.bodyEn : "",
        images: Array.isArray(item.images)
          ? item.images.filter((value): value is string => typeof value === "string" && value.length > 0)
          : [],
        publishedAt: toDateInputValue(typeof item.publishedAt === "string" ? item.publishedAt : undefined),
      };
    },
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const titleUz = getStringField(data, "titleUz") ?? "";
      const titleRu = getStringField(data, "titleRu");
      const titleEn = getStringField(data, "titleEn");
      const bodyUz = getStringField(data, "bodyUz") ?? "";
      const bodyRu = getStringField(data, "bodyRu");
      const bodyEn = getStringField(data, "bodyEn");
      const images = getStringArrayField(data, "images");
      const publishedAtRaw = getStringField(data, "publishedAt");
      const publishedAt = toOffsetDateTimeString(publishedAtRaw);

      return {
        titleUz,
        titleRu: titleRu || undefined,
        titleEn: titleEn || undefined,
        bodyUz,
        bodyRu: bodyRu || undefined,
        bodyEn: bodyEn || undefined,
        images,
        publishedAt,
      };
    },
    service: {
      list: () => NewsControllerService.list2(),
      get: (id: number) => NewsControllerService.get2({ id }),
      create: (data: Record<string, unknown>) =>
        NewsControllerService.create2({ requestBody: data as News }),
      update: (id: number, data: Record<string, unknown>) =>
        NewsControllerService.update2({ id, requestBody: data as News }),
      remove: (id: number) => NewsControllerService.delete2({ id }),
    },
  },
  gallery: {
    key: "gallery",
    title: "Galereya",
    description: "Media fayllar boshqaruvi.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Sarlavha" },
      {
        accessorKey: "mediaType",
        header: "Turi",
        cell: ({ row }) => {
          const type = getStringField(row.original, "mediaType");
          return type === "video" ? "Video" : "Rasm";
        },
      },
      { accessorKey: "url", header: "URL" },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      title: z.string().min(1, { message: "Majburiy" }),
      url: z.string().min(1, { message: "Media manzilini kiriting" }),
      mediaType: z.enum(["image", "video"]).default("image"),
    }),
    defaultValues: {
      title: "",
      url: "",
      mediaType: "image",
    },
    fields: [
      { type: "text", name: "title", label: "Sarlavha", required: true },
      {
        type: "media-upload",
        name: "url",
        label: "Media fayl",
        uploadCategory: "gallery",
        mediaTypeField: "mediaType",
        accept: "image/*",
        manualInputWhen: ["video"],
        manualInputPlaceholder: "https://www.youtube.com/watch?v=...",
        manualInputHelperText: "Faqat YouTube havolasini kiriting, avtomatik embed formatga o‘zgartiriladi.",
        mode: "single",
        helperText: "Fayl tanlansa darhol serverga yuklanadi, bekor qilinsa yangi yuklangan fayl o‘chirib tashlanadi.",
      },
    ],
    toFormValues: (record) => {
      const item = (record as Partial<Gallery>) ?? {};
      return {
        title: typeof item.title === "string" ? item.title : "",
        url: typeof item.url === "string" ? item.url : "",
        mediaType: typeof item.mediaType === "string" ? item.mediaType.toLowerCase() : "image",
      };
    },
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const title = getStringField(data, "title") ?? "";
      const url = getStringField(data, "url") ?? "";
      const mediaTypeRaw = getStringField(data, "mediaType")?.toLowerCase();
      const mediaType = mediaTypeRaw === "video" || mediaTypeRaw === "image" ? mediaTypeRaw : undefined;
      return {
        title,
        url,
        mediaType,
      };
    },
    service: {
      list: () => GalleryControllerService.list8(),
      get: (id: number) => GalleryControllerService.get8({ id }),
      create: (data: Record<string, unknown>) =>
        GalleryControllerService.create8({ requestBody: data as Gallery }),
      update: (id: number, data: Record<string, unknown>) =>
        GalleryControllerService.update8({ id, requestBody: data as Gallery }),
      remove: (id: number) => GalleryControllerService.delete8({ id }),
    },
  },
  journal: {
    key: "journal",
    title: "Journal",
    description: "Jurnal yozuvlari.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "image", header: "Rasm" },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      image: z.string().min(1, { message: "Rasm tanlang" }),
    }),
    defaultValues: {
      image: "",
    },
    fields: [
      {
        type: "media-upload",
        name: "image",
        label: "Rasm",
        uploadCategory: "journal",
        mode: "single",
        accept: "image/*",
        helperText: "Rasm tanlanganda darhol yuklanadi, kerak bo‘lsa o‘chirib tashlang.",
      },
    ],
    toFormValues: (record) => {
      const item = (record as Partial<Journal>) ?? {};
      return {
        image: typeof item.image === "string" ? item.image : "",
      };
    },
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const image = getStringField(data, "image") ?? "";
      return {
        image,
      };
    },
    service: {
      list: () => JournalControllerService.list6(),
      get: (id: number) => JournalControllerService.get6({ id }),
      create: (data: Record<string, unknown>) =>
        JournalControllerService.create6({ requestBody: data as Journal }),
      update: (id: number, data: Record<string, unknown>) =>
        JournalControllerService.update6({ id, requestBody: data as Journal }),
      remove: (id: number) => JournalControllerService.delete6({ id }),
    },
  },
  famous: {
    key: "famous",
    title: "Famous",
    description: "Mashhur mijozlar haqida ma’lumot.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "titleUz", header: "Sarlavha (UZ)" },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      ...multilingualText("title"),
      ...multilingualText("body"),
      images: z
        .array(
          z.string().min(1, {
            message: "Rasm URL bo‘sh bo‘lishi mumkin emas",
          })
        )
        .default([]),
      slug: z.string().min(1, { message: "Slug majburiy" }),
    }),
    defaultValues: {
      titleUz: "",
      titleRu: "",
      titleEn: "",
      bodyUz: "",
      bodyRu: "",
      bodyEn: "",
      images: [],
      slug: "",
    },
    fields: [
      { type: "multilingual", baseName: "title", label: "Sarlavha", required: true },
      {
        type: "multilingual",
        baseName: "body",
        label: "Matn",
        kind: "editor",
        required: true,
        uploadCategory: "famous",
      },
      { type: "text", name: "slug", label: "Slug", required: true, placeholder: "famous-slug" },
      {
        type: "media-upload",
        name: "images",
        label: "Rasmlar",
        uploadCategory: "famous",
        mode: "multiple",
        accept: "image/*",
        helperText: "Rasmlar tanlanganda darhol yuklanadi, bekor qilsangiz yangi yuklanganlar o‘chirib tashlanadi.",
      },
    ],
    toFormValues: (record) => {
      const item = (record as Partial<Famous>) ?? {};
      return {
        titleUz: typeof item.titleUz === "string" ? item.titleUz : "",
        titleRu: typeof item.titleRu === "string" ? item.titleRu : "",
        titleEn: typeof item.titleEn === "string" ? item.titleEn : "",
        bodyUz: typeof item.bodyUz === "string" ? item.bodyUz : "",
        bodyRu: typeof item.bodyRu === "string" ? item.bodyRu : "",
        bodyEn: typeof item.bodyEn === "string" ? item.bodyEn : "",
        slug: typeof item.slug === "string" ? item.slug : "",
        images: Array.isArray(item.images)
          ? item.images.filter((value): value is string => typeof value === "string" && value.length > 0)
          : [],
      };
    },
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const titleUz = getStringField(data, "titleUz") ?? "";
      const titleRu = getStringField(data, "titleRu");
      const titleEn = getStringField(data, "titleEn");
      const bodyUz = getStringField(data, "bodyUz") ?? "";
      const bodyRu = getStringField(data, "bodyRu");
      const bodyEn = getStringField(data, "bodyEn");
      const images = getStringArrayField(data, "images");
      const slug = getStringField(data, "slug") ?? "";

      return {
        titleUz,
        titleRu: titleRu || undefined,
        titleEn: titleEn || undefined,
        bodyUz,
        bodyRu: bodyRu || undefined,
        bodyEn: bodyEn || undefined,
        images,
        slug,
      } satisfies Partial<Famous>;
    },
    service: {
      list: () => FamousControllerService.list9(),
      get: (id: number) => FamousControllerService.get9({ id }),
      create: (data: Record<string, unknown>) =>
        FamousControllerService.create9({ requestBody: data as Famous }),
      update: (id: number, data: Record<string, unknown>) =>
        FamousControllerService.update9({ id, requestBody: data as Famous }),
      remove: (id: number) => FamousControllerService.delete9({ id }),
    },
  },
  contacts: {
    key: "contacts",
    title: "Kontaktlar",
    description: "Kontakt ma’lumotlari.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "phoneNumber", header: "Telefon" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "address", header: "Manzil" },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      phoneNumber: z.string().min(1, { message: "Majburiy" }),
      email: z.string().email("Email noto‘g‘ri"),
      address: z.string().min(1, { message: "Majburiy" }),
      bannerMediaType: z.enum(["image", "video"]).default("image"),
      banner: z.string().optional().or(z.literal("")),
      introductionVideo: z.string().optional().or(z.literal("")),
      socialMedia: z
        .array(
          z.object({
            platform: CONTACT_SOCIAL_PLATFORM_SCHEMA,
            link: z.string().url("URL noto‘g‘ri"),
          })
        )
        .default([]),
    }),
    defaultValues: {
      phoneNumber: "",
      email: "",
      address: "",
      bannerMediaType: "image",
      banner: "",
      introductionVideo: "",
      socialMedia: [],
    },
    fields: [
      { type: "text", name: "phoneNumber", label: "Telefon", required: true },
      { type: "text", name: "email", label: "Email", required: true },
      { type: "text", name: "address", label: "Manzil", required: true },
      {
        type: "media-upload",
        name: "banner",
        label: "Banner",
        uploadCategory: "contacts",
        mediaTypeField: "bannerMediaType",
        mode: "single",
        accept: "image/*,video/*",
        helperText: "Rasm yoki video yuklang. Video tanlanganda faylni yuklab, ko‘rish tugmasidan tekshiring.",
      },
      {
        type: "media-upload",
        name: "introductionVideo",
        label: "Tanishuv videosi",
        uploadCategory: "contacts",
        mode: "single",
        accept: "video/*",
        uploadButtonLabel: "Video",
        counterLabel: "video",
        helperText: "Video yuklang. Saqlanmaguncha bekor qilinsa, yangi yuklangan video o‘chiriladi.",
      },
      {
        type: "social-links",
        name: "socialMedia",
        label: "Ijtimoiy tarmoqlar",
        helperText: "Platformani tanlab, havolasini kiriting.",
      },
    ],
    toFormValues: (record) => {
      const item = (record as Partial<Contact>) ?? {};
      const extendedItem = item as Partial<Contact> & { banner?: string; bannerMediaType?: string };
      const socials = Array.isArray(item.socialMedia)
        ? item.socialMedia
            .map((entry) => {
              if (typeof entry === "string") {
                try {
                  const parsed = JSON.parse(entry) as Record<string, unknown>;
                  const platformRaw = getStringField(parsed, "platform");
                  const normalizedPlatform =
                    typeof platformRaw === "string" ? platformRaw.trim().toLowerCase() : "";
                  const platform = CONTACT_SOCIAL_PLATFORM_SET.has(normalizedPlatform) ? normalizedPlatform : "";
                  const linkRaw = getStringField(parsed, "link");
                  const link = typeof linkRaw === "string" ? linkRaw.trim() : "";
                  return { platform, link };
                } catch {
                  const normalizedEntry = typeof entry === "string" ? entry.trim().toLowerCase() : "";
                  const platform = CONTACT_SOCIAL_PLATFORM_SET.has(normalizedEntry) ? normalizedEntry : "";
                  return { platform, link: "" };
                }
              }
              if (entry && typeof entry === "object") {
                const recordEntry = entry as Record<string, unknown>;
                const platformRaw = getStringField(recordEntry, "platform");
                const normalizedPlatform =
                  typeof platformRaw === "string" ? platformRaw.trim().toLowerCase() : "";
                const platform = CONTACT_SOCIAL_PLATFORM_SET.has(normalizedPlatform) ? normalizedPlatform : "";
                const linkRaw = getStringField(recordEntry, "link");
                const link = typeof linkRaw === "string" ? linkRaw.trim() : "";
                return { platform, link };
              }
              return { platform: "", link: "" };
            })
            .filter((entry) => entry.platform || entry.link)
        : [];
      return {
        phoneNumber: typeof item.phoneNumber === "string" ? item.phoneNumber : "",
        email: typeof item.email === "string" ? item.email : "",
        address: typeof item.address === "string" ? item.address : "",
        banner: typeof extendedItem.banner === "string" ? extendedItem.banner : "",
        introductionVideo: typeof item.introductionVideo === "string" ? item.introductionVideo : "",
        bannerMediaType:
          typeof extendedItem.bannerMediaType === "string"
            ? extendedItem.bannerMediaType.toLowerCase() === "video"
              ? "video"
              : "image"
            : "image",
        socialMedia: socials,
      };
    },
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const phoneNumber = getStringField(data, "phoneNumber") ?? "";
      const email = getStringField(data, "email") ?? "";
      const address = getStringField(data, "address") ?? "";
      const banner = getStringField(data, "banner");
      const introductionVideo = getStringField(data, "introductionVideo");
      const bannerMediaTypeRaw = getStringField(data, "bannerMediaType")?.toLowerCase();
      const bannerMediaType = bannerMediaTypeRaw === "video" ? "video" : "image";
      const socialRaw = data.socialMedia;
      const socialMedia = Array.isArray(socialRaw)
        ? (socialRaw as unknown[])
            .map((entry) => {
              if (entry && typeof entry === "object") {
                const recordEntry = entry as Record<string, unknown>;
                const platformRaw = getStringField(recordEntry, "platform");
                const normalizedPlatform =
                  typeof platformRaw === "string" ? platformRaw.trim().toLowerCase() : "";
                const platform = CONTACT_SOCIAL_PLATFORM_SET.has(normalizedPlatform) ? normalizedPlatform : "";
                const linkRaw = getStringField(recordEntry, "link");
                const link = typeof linkRaw === "string" ? linkRaw.trim() : "";
                if (!platform || !link) {
                  return null;
                }
                return JSON.stringify({ platform, link });
              }
              return null;
            })
            .filter((entry): entry is string => typeof entry === "string")
        : [];
      return {
        phoneNumber,
        email,
        address,
        banner: banner || undefined,
        introductionVideo: introductionVideo || undefined,
        bannerMediaType,
        socialMedia,
      };
    },
    service: {
      list: () => ContactControllerService.list10(),
      get: (id: number) => ContactControllerService.get10({ id }),
      create: (data: Record<string, unknown>) =>
        ContactControllerService.create10({ requestBody: data as Contact }),
      update: (id: number, data: Record<string, unknown>) =>
        ContactControllerService.update10({ id, requestBody: data as Contact }),
      remove: (id: number) => ContactControllerService.delete10({ id }),
    },
  },
  locations: {
    key: "locations",
    title: "Filiallar",
    description: "Lokatsiyalar va ish vaqtlari.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nameUz", header: "Nom (UZ)" },
      {
        accessorKey: "region",
        header: "Hudud",
        cell: ({ row }) => {
          const region = getStringField(row.original, "region");
          if (!region) {
            return "";
          }
          return REGION_LABEL_LOOKUP.get(region) ?? region;
        },
      },
      {
        accessorKey: "openTime",
        header: "Ochilish",
        cell: ({ row }) =>
          localTimeToString(getLocalTimeField(row.original, "openTime") as LocalTime | undefined),
      },
      {
        accessorKey: "closeTime",
        header: "Yopilish",
        cell: ({ row }) =>
          localTimeToString(getLocalTimeField(row.original, "closeTime") as LocalTime | undefined),
      },
      {
        accessorKey: "workDays",
        header: "Ish kunlari",
        cell: ({ row }) => getStringArrayField(row.original, "workDays").join(", "),
      },
    ],
    schema: z.object({
      ...multilingualText("name"),
      region: REGION_VALUE_ENUM,
      ...multilingualText("address"),
      mapTag: z.string().optional().or(z.literal("")),
      openTime: z.string().optional().or(z.literal("")),
      closeTime: z.string().optional().or(z.literal("")),
      workDays: z.array(z.string()).default([]),
      images: z
        .array(
          z.string().min(1, {
            message: "Rasm havolasini ko‘rsating",
          })
        )
        .default([]),
    }),
    defaultValues: {
      nameUz: "",
      nameRu: "",
      nameEn: "",
      region: "",
      addressUz: "",
      addressRu: "",
      addressEn: "",
      mapTag: "",
      openTime: "",
      closeTime: "",
      workDays: [],
      images: [],
    },
    fields: [
      { type: "multilingual", baseName: "name", label: "Nom", required: true },
      { type: "select", name: "region", label: "Hudud", options: REGION_SELECT_OPTIONS, required: true },
      { type: "multilingual", baseName: "address", label: "Manzil", required: true },
      { type: "textarea", name: "mapTag", label: "Map tag" },
      { type: "time", name: "openTime", label: "Ochilish vaqti" },
      { type: "time", name: "closeTime", label: "Yopilish vaqti" },
      { type: "array", name: "workDays", label: "Ish kunlari", itemLabel: "Kun" },
      {
        type: "media-upload",
        name: "images",
        label: "Rasmlar",
        uploadCategory: "locations",
        helperText: "Rasmlar yuklanganda serverga jo‘natiladi, bekor qilinsachi yangi yuklangan fayllar o‘chiriladi.",
      },
    ],
    toFormValues: (record) => {
      const location = (record as Partial<Location>) ?? {};

      const addressUz =
        typeof location.addressUz === "string" && location.addressUz
          ? location.addressUz
          : typeof location.address === "string"
            ? location.address
            : "";
      const addressRu = typeof location.addressRu === "string" ? location.addressRu : "";
      const addressEn = typeof location.addressEn === "string" ? location.addressEn : "";

      return {
        ...location,
        openTime: localTimeToString(location.openTime as LocalTime | undefined),
        closeTime: localTimeToString(location.closeTime as LocalTime | undefined),
        workDays: Array.isArray(location.workDays) ? location.workDays : [],
        images: Array.isArray(location.images) ? location.images : [],
        mapTag: typeof location.mapTag === "string" ? location.mapTag : "",
        region: typeof location.region === "string" ? location.region : "",
        addressUz,
        addressRu,
        addressEn,
      };
    },
    toPayload: (values) => {
      const data = values as Record<string, unknown>;
      const nameUz = getStringField(data, "nameUz") ?? "";
      const nameRu = getStringField(data, "nameRu");
      const nameEn = getStringField(data, "nameEn");
      const mapTag = getStringField(data, "mapTag");
      const workDays = getStringArrayField(data, "workDays");
      const images = getStringArrayField(data, "images");
      const openTime = getStringField(data, "openTime") || undefined;
      const closeTime = getStringField(data, "closeTime") || undefined;
      const regionRaw = getStringField(data, "region");
      const region = regionRaw ? REGION_VALUE_ENUM.parse(regionRaw) : undefined;
      const addressUz = getStringField(data, "addressUz") ?? "";
      const addressRuRaw = getStringField(data, "addressRu");
      const addressEnRaw = getStringField(data, "addressEn");
      const fallbackAddress = getStringField(data, "address");
      const address = addressUz || fallbackAddress || "";
      const hasAddressRu = Object.prototype.hasOwnProperty.call(data, "addressRu");
      const hasAddressEn = Object.prototype.hasOwnProperty.call(data, "addressEn");

      const payload: Record<string, unknown> = {
        nameUz,
        nameRu: nameRu || undefined,
        nameEn: nameEn || undefined,
        region,
        mapTag: mapTag || undefined,
        address,
        workDays,
        images,
        openTime,
        closeTime,
      };

      payload.addressUz = addressUz;
      if (hasAddressRu) {
        payload.addressRu = addressRuRaw ?? "";
      }
      if (hasAddressEn) {
        payload.addressEn = addressEnRaw ?? "";
      }

      return payload;
    },
    service: {
      list: () => LocationControllerService.list5(),
      get: (id: number) => LocationControllerService.get5({ id }),
      create: (data: Record<string, unknown>) =>
        LocationControllerService.create5({ requestBody: data as Location }),
      update: (id: number, data: Record<string, unknown>) =>
        LocationControllerService.update5({ id, requestBody: data as Location }),
      remove: (id: number) => LocationControllerService.delete5({ id }),
    },
  },
  "user-emails": {
    key: "user-emails",
    title: "Foydalanuvchi xatlari",
    description: "Email ro‘yxati.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      email: z.string().email("Email noto‘g‘ri"),
    }),
    defaultValues: {
      email: "",
    },
    fields: [{ type: "text", name: "email", label: "Email", required: true }],
    service: {
      list: () => UserEmailControllerService.list1(),
      get: (id: number) => UserEmailControllerService.get1({ id }),
      create: (data: Record<string, unknown>) =>
        UserEmailControllerService.create1({ requestBody: data as UserEmail }),
      update: (id: number, data: Record<string, unknown>) =>
        UserEmailControllerService.update1({ id, requestBody: data as UserEmail }),
      remove: (id: number) => UserEmailControllerService.delete1({ id }),
    },
  },
  vacancies: {
    key: "vacancies",
    title: "Bo‘sh ish o‘rinlari",
    description: "Vakansiyalar boshqaruvi.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "titleUz", header: "Sarlavha (UZ)" },
      { accessorKey: "location", header: "Joylashuv" },
      {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => formatDate(getStringField(row.original, "deadline")),
      },
      {
        accessorKey: "active",
        header: "Aktiv",
        cell: ({ row }) => (getBooleanField(row.original, "active") ? "Ha" : "Yo‘q"),
      },
    ],
    schema: z.object({
      ...multilingualText("title"),
      ...multilingualText("body", false),
      location: z.string().min(1, { message: "Majburiy" }),
      employmentType: z.string().optional().or(z.literal("")),
      salaryMin: z.union([z.coerce.number().nonnegative(), z.nan()]).optional(),
      salaryMax: z.union([z.coerce.number().nonnegative(), z.nan()]).optional(),
      deadline: z.string().optional().or(z.literal("")),
      active: z.boolean().default(true),
    }),
    defaultValues: {
      titleUz: "",
      titleRu: "",
      titleEn: "",
      bodyUz: "",
      bodyRu: "",
      bodyEn: "",
      location: "",
      employmentType: "",
      salaryMin: undefined,
      salaryMax: undefined,
      deadline: "",
      active: true,
    },
    fields: [
      { type: "multilingual", baseName: "title", label: "Sarlavha", required: true },
      {
        type: "multilingual",
        baseName: "body",
        label: "Mazmun",
        kind: "editor",
        uploadCategory: "vacancies",
      },
      { type: "text", name: "location", label: "Joylashuv", required: true },
      { type: "text", name: "employmentType", label: "Bandlik turi" },
      { type: "number", name: "salaryMin", label: "Minimal maosh" },
      { type: "number", name: "salaryMax", label: "Maksimal maosh" },
      { type: "date", name: "deadline", label: "Deadline" },
      { type: "boolean", name: "active", label: "Faol" },
    ],
    service: {
      list: () => VacancyControllerService.list(),
      get: (id: number) => VacancyControllerService.get({ id }),
      create: (data: Record<string, unknown>) =>
        VacancyControllerService.create({ requestBody: data as Vacancy }),
      update: (id: number, data: Record<string, unknown>) =>
        VacancyControllerService.update({ id, requestBody: data as Vacancy }),
      remove: (id: number) => VacancyControllerService.delete({ id }),
    },
  },
  "job-requests": {
    key: "job-requests",
    title: "Ish so‘rovlari",
    description: "Vakansiya arizalari.",
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "firstName", header: "Ism" },
      { accessorKey: "lastName", header: "Familiya" },
      { accessorKey: "phoneNumber", header: "Telefon" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "createdAt",
        header: "Yaratildi",
        cell: ({ row }) => formatDateTime(getStringField(row.original, "createdAt")),
      },
    ],
    schema: z.object({
      firstName: z.string().min(1, { message: "Majburiy" }),
      lastName: z.string().min(1, { message: "Majburiy" }),
      phoneNumber: z.string().min(1, { message: "Majburiy" }),
      email: z.string().email("Email noto‘g‘ri"),
      file: z.string().optional().or(z.literal("")),
      position: z.string().optional().or(z.literal("")),
    }),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      file: "",
      position: "",
    },
    fields: [
      { type: "text", name: "firstName", label: "Ism", required: true },
      { type: "text", name: "lastName", label: "Familiya", required: true },
      { type: "text", name: "phoneNumber", label: "Telefon", required: true },
      { type: "text", name: "email", label: "Email", required: true },
      { type: "text", name: "position", label: "Lavozim" },
      {
        type: "media-upload",
        name: "file",
        label: "Fayl",
        uploadCategory: "job-requests",
        mode: "single",
        accept: "image/*,application/pdf",
        helperText: "Fayl tanlanganda darhol yuklanadi. Bekor qilish tugmasi bosilsa, fayl avtomatik o‘chiriladi.",
        uploadButtonLabel: "Fayl",
        counterLabel: "fayl",
      },
    ],
    service: {
      list: () => JobRequestControllerService.list7(),
      get: (id: number) => JobRequestControllerService.get7({ id }),
      create: (data: Record<string, unknown>) =>
        JobRequestControllerService.create7({ requestBody: data as JobRequest }),
      update: (id: number, data: Record<string, unknown>) =>
        JobRequestControllerService.update7({ id, requestBody: data as JobRequest }),
      remove: (id: number) => JobRequestControllerService.delete7({ id }),
    },
  },
};

export function getResourceConfig(key: ResourceKey): ResourceConfig {
  return resourceConfigs[key];
}

export const resourceList = Object.values(resourceConfigs);
