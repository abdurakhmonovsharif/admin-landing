import type { ColumnDef } from "@tanstack/react-table";
import type { z } from "zod";

export type MultilingualKind = "text" | "textarea" | "editor";

export type FieldDescriptor =
  | {
      type: "text" | "number" | "textarea" | "date" | "time";
      name: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      type: "multilingual";
      baseName: string;
      label: string;
      required?: boolean;
      kind?: MultilingualKind;
      placeholder?: string;
      uploadCategory?: string;
    }
  | {
      type: "array";
      name: string;
      label: string;
      itemLabel?: string;
      placeholder?: string;
      validation?: "url" | "string";
    }
  | {
      type: "media-upload";
      name: string;
      label: string;
      uploadCategory: string;
      maxFiles?: number;
      accept?: string;
      helperText?: string;
      mode?: "single" | "multiple";
      mediaTypeField?: string;
      manualInputWhen?: string[];
      manualInputPlaceholder?: string;
      manualInputHelperText?: string;
      uploadButtonLabel?: string;
      counterLabel?: string;
    }
  | {
      type: "social-links";
      name: string;
      label: string;
      uploadCategory: string;
      helperText?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      placeholder?: string;
      options: { label: string; value: string }[];
      valueType?: "string" | "number";
      required?: boolean;
    }
  | {
      type: "boolean";
      name: string;
      label: string;
    };

export type ResourceConfig = {
  key: ResourceKey;
  title: string;
  description?: string;
  columns: ColumnDef<unknown, unknown>[];
  schema: z.ZodTypeAny;
  defaultValues: Record<string, unknown>;
  fields: FieldDescriptor[];
  service: ResourceService;
  toFormValues?: (record: unknown) => Record<string, unknown>;
  toPayload?: (values: Record<string, unknown>, original?: unknown) => Record<string, unknown>;
};

export type ResourceService = {
  list: () => Promise<unknown[]>;
  get: (id: number) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
  remove: (id: number) => Promise<void>;
};

export type ResourceKey =
  | "about"
  | "news"
  | "gallery"
  | "journal"
  | "famous"
  | "contacts"
  | "locations"
  | "user-emails"
  | "vacancies"
  | "job-requests";
